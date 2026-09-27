import type {} from '@payloadcms/db-postgres';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type SanitizedConfig } from 'payload';
import { describe, expect, it } from 'vitest';

const APPS_DIR = path.resolve(import.meta.dirname, '../../apps');

const APPS = readdirSync(APPS_DIR).filter((name) => existsSync(path.join(APPS_DIR, name, 'package.json')));

/**
 * Схему базы стенда создают миграции, а в разработке Payload накатывает ее сам. Поле или коллекция, добавленные
 * в демо без миграции, в разработке работают, а на стенде падают на первом запросе. Тест сравнивает то же, что
 * `payload migrate:create`: снимок последней миграции каждого демо со схемой из его конфига. Схема собирается
 * без подключения к базе и без засева: демо не мешают друг другу и базе интеграционных тестов.
 */
describe('миграции демо', () => {
  it('в apps/ есть демо, развернутые из шаблона', () => {
    expect(APPS).toContain('template');
    expect(APPS.length).toBeGreaterThan(1);
  });

  it.each(APPS)(
    '«%s»: схема из миграций совпадает со схемой конфига — иначе `yarn workspace @mrshkn/demo-<демо> payload migrate:create <имя>`',
    async (app) => {
      const { default: config } = (await import(`../../apps/${app}/src/payload.config.ts`)) as {
        default: Promise<SanitizedConfig>;
      };
      const payload = await getPayload({
        config,
        key: `migrations-${app}`,
        disableDBConnect: true,
        disableOnInit: true,
      });
      const { generateDrizzleJson, generateMigration } = payload.db.requireDrizzleKit();
      const directory = payload.db.migrationDir;

      expect(directory).toBe(path.join(APPS_DIR, app, 'src/migrations'));

      const snapshots = existsSync(directory)
        ? readdirSync(directory)
            .filter((file) => file.endsWith('.json'))
            .sort()
        : [];
      const latest = snapshots.at(-1);
      const before = latest
        ? JSON.parse(readFileSync(path.join(directory, latest), 'utf8'))
        : payload.db.defaultDrizzleSnapshot;

      const statements = await generateMigration(before, await generateDrizzleJson(payload.db.schema));

      expect(statements).toEqual([]);
    },
  );
});
