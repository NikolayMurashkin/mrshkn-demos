import type { PostgresAdapter } from '@payloadcms/db-postgres';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import resetTestDatabase from './setup';

/**
 * Окружение стенда без подъема миграций: `NODE_ENV=production` — адаптер не накатывает схему сам, `MIGRATE_ON_START`
 * не задан — миграции идут руками в тесте. Конфиг грузится после смены окружения: он читает флаг миграций при загрузке.
 */
(process.env as Record<string, string>).NODE_ENV = 'production';
delete process.env.MIGRATE_ON_START;

type Migration = {
  name: string;
  up: (args: { db: unknown; payload: Payload; req: unknown }) => Promise<void>;
};

type SeedItem = Record<string, unknown> & { photo?: string | null };

type PhotoDoc = { id: number | string; slug: string; photo?: string | null };

type Column = { is_nullable: 'YES' | 'NO'; data_type: string };

type ValidationErrorLike = { name?: string; data?: { errors?: { path?: string }[] } };

const APPS_DIR = path.resolve(import.meta.dirname, '../../apps');

/** Документ из элемента засева — так же, как его создает засев приложения. */
type BuildDoc = (item: SeedItem, app: string) => Promise<Record<string, unknown>>;

const fromDoctor: BuildDoc = async ({ education, ...doctor }) => ({
  ...doctor,
  education: ((education as string[] | undefined) ?? []).map((item) => ({ item })),
  services: [],
});

const fromArticle: BuildDoc = async ({ sections, ...article }, app) => {
  const { lexicalFromSections } = await importApp<{ lexicalFromSections: (sections: unknown) => unknown }>(
    app,
    'cms/seed/lexical.ts',
  );

  return { ...article, content: lexicalFromSections(sections) };
};

const fromMenuItem: BuildDoc = async (item) => ({ ...item });

const APPS = [
  {
    app: 'dental',
    collection: 'doctors',
    table: 'doctors',
    seedFn: 'seedClinic',
    seed: 'DOCTORS',
    build: fromDoctor,
  },
  {
    app: 'expert',
    collection: 'articles',
    table: 'articles',
    seedFn: 'seedExpert',
    seed: 'ARTICLES',
    build: fromArticle,
  },
  {
    app: 'coffee',
    collection: 'menu-items',
    table: 'menu_items',
    seedFn: 'seedCoffee',
    seed: 'MENU_ITEMS',
    build: fromMenuItem,
  },
];

/** Модуль демо: пока файла нет, тест падает на assert, а не на сборке файла. */
async function importApp<T>(app: string, relative: string): Promise<T> {
  const file = path.join(APPS_DIR, app, 'src', relative);

  expect(existsSync(file), `нет apps/${app}/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
}

/**
 * У демо разные схемы, а база интеграционных тестов одна: перед каждым приложением и в конце схема пустая, чтобы
 * Payload соседнего файла не спрашивал в терминале о потере данных.
 */
describe.each(APPS)('поле photo: $app / $collection', ({ app, collection, table, seedFn, seed, build }) => {
  let payload: Payload;
  let client: Client;
  let migrated: Promise<void>;
  let seedItems: SeedItem[];

  const drizzle = () => (payload.db as unknown as PostgresAdapter).drizzle;

  const docs = async () =>
    (await payload.find({ collection: collection as never, limit: 0, depth: 0 })).docs as unknown as PhotoDoc[];

  beforeAll(async () => {
    await resetTestDatabase();
    client = new Client({ connectionString: process.env.DATABASE_URL ?? '' });
    await client.connect();

    const { default: config } = await importApp<{ default: Promise<SanitizedConfig> }>(app, 'payload.config.ts');
    const { migrations } = await importApp<{ migrations: Migration[] }>(app, 'migrations/index.ts');

    seedItems = (await importApp<Record<string, SeedItem[]>>(app, 'cms/seed/data.ts'))[seed] ?? [];
    payload = await getPayload({ config, key: `photo-${app}`, disableOnInit: true });

    /** Миграции идут один раз, по порядку; сценарии ниже читают базу после них. */
    migrated = (async () => {
      for (const migration of migrations) {
        await migration.up({ db: drizzle(), payload, req: {} });
      }
    })();
    migrated.catch(() => undefined);
  });

  afterAll(async () => {
    await payload?.destroy();
    await client?.end();
    await resetTestDatabase();
  });

  it(`I1: миграции на чистой базе дают ${table}.photo — varchar, null допустим`, async () => {
    await expect(migrated).resolves.toBeUndefined();

    const { rows } = await client.query<Column>(
      `SELECT is_nullable, data_type
         FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'photo'`,
      [table],
    );

    expect(rows).toEqual([{ is_nullable: 'YES', data_type: 'character varying' }]);
  });

  it(`I2: засев ${seedFn} проходит после миграций, photo — пусто или ключ карты кадров`, async () => {
    const { PHOTOS } = await importApp<{ PHOTOS: Record<string, unknown> }>(app, 'assets/photos/index.ts');

    await migrated.catch(() => undefined);

    const seedModule = await importApp<Record<string, (payload: Payload) => Promise<void>>>(app, 'cms/seed/seed.ts');
    const run = seedModule[seedFn];

    expect(typeof run, `${seedFn} из apps/${app}/src/cms/seed/seed.ts`).toBe('function');
    await expect(run?.(payload)).resolves.toBeUndefined();

    const created = await docs();
    const keys = Object.keys(PHOTOS);

    expect(created).toHaveLength(seedItems.length);

    for (const { slug, photo } of created) {
      expect(
        photo === undefined || photo === null || photo === '' || keys.includes(photo),
        `${slug}.photo = ${JSON.stringify(photo)} — пусто или ключ PHOTOS`,
      ).toBe(true);
    }
  });

  it('I3: документ с неизвестным ключом кадра не создается — ошибка проверки поля photo', async () => {
    await migrated.catch(() => undefined);

    const [first] = seedItems;

    expect(first, `первый элемент ${seed}`).toBeDefined();

    const data = { ...(await build(first ?? {}, app)), slug: 'photo-check', photo: 'no-such-photo' };
    const created = payload.create({ collection: collection as never, data: data as never });
    const error = (await created.then(
      () => undefined,
      (reason: unknown) => reason,
    )) as ValidationErrorLike | undefined;

    expect(error, 'create отклонен').toBeDefined();
    expect(error?.name).toBe('ValidationError');
    expect(error?.data?.errors?.map(({ path: field }) => field)).toContain('photo');

    const { totalDocs } = await payload.count({
      collection: collection as never,
      where: { slug: { equals: 'photo-check' } } as never,
    });

    expect(totalDocs, 'документ photo-check не появился').toBe(0);
  });
});
