import { existsSync } from 'node:fs';
import path from 'node:path';
import type { CollectionConfig, Field } from 'payload';
import { describe, expect, it } from 'vitest';

type Validate = (value: unknown, options: unknown) => Promise<string | true> | string | true;

type PhotoField = Field & { name?: string; type: string; required?: boolean; validate?: unknown };

type SeedItem = { photo?: string | null };

const APPS_DIR = path.resolve(import.meta.dirname, '../../apps');

/** Поле `photo` — ключ кадра из `src/assets` приложения; карта ключ → файл у каждого приложения своя. */
const CASES = [
  { app: 'dental', collection: 'Doctors', seed: 'DOCTORS' },
  { app: 'expert', collection: 'Articles', seed: 'ARTICLES' },
  { app: 'coffee', collection: 'MenuItems', seed: 'MENU_ITEMS' },
] as const;

type Case = (typeof CASES)[number];

/** Модуль демо: пока файла нет, тест падает на assert, а не на сборке файла. */
const importApp = async <T>(app: string, relative: string): Promise<T> => {
  const file = path.join(APPS_DIR, app, 'src', relative);

  expect(existsSync(file), `нет apps/${app}/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const loadPhotos = async (app: string) =>
  (await importApp<{ PHOTOS: Record<string, unknown> }>(app, 'assets/photos/index.ts')).PHOTOS;

const loadSeed = async ({ app, seed }: Case) =>
  (await importApp<Record<string, SeedItem[]>>(app, 'cms/seed/data.ts'))[seed];

/** Поле `photo` на верхнем уровне `fields` коллекции. */
const photoField = async ({ app, collection }: Case) => {
  const exports = await importApp<Record<string, CollectionConfig>>(app, `cms/collections/${collection}.ts`);
  const config = exports[collection];

  expect(config, `экспорт ${collection} из apps/${app}/src/cms/collections/${collection}.ts`).toBeDefined();

  const field = (config?.fields as PhotoField[] | undefined)?.find((candidate) => candidate.name === 'photo');

  expect(field, `поле photo в fields коллекции ${collection}`).toBeDefined();

  return field as PhotoField;
};

/** `validate` поля: второй аргумент — пустой объект опций, проверка ключа его не читает. */
const validatorOf = async (target: Case) => {
  const field = await photoField(target);

  expect(typeof field.validate, `validate поля photo у ${target.collection}`).toBe('function');

  const validate = field.validate as Validate;

  return async (value: unknown) => validate(value, {});
};

describe.each(CASES)('поле photo: $app / $collection', (target) => {
  it('F1: поле photo — текст (не upload и не select), необязательное, с проверкой', async () => {
    const field = await photoField(target);

    expect(field.type).toBe('text');
    expect(field.required ?? false, 'photo не обязательно').toBe(false);
    expect(typeof field.validate, 'validate — функция').toBe('function');
  });

  it('F2: проверка пропускает пусто и ключи карты кадров, неизвестный ключ — строка-ошибка с ключом', async () => {
    const validate = await validatorOf(target);
    const photos = await loadPhotos(target.app);

    const unknown = await validate('no-such-photo');

    expect(typeof unknown, 'неизвестный ключ — строка-ошибка').toBe('string');
    expect(unknown).toContain('no-such-photo');

    for (const value of [undefined, null, '', ...Object.keys(photos)]) {
      expect(await validate(value), `ключ ${JSON.stringify(value)}`).toBe(true);
    }
  });

  it('F3: в засеве photo — пусто или ключ карты кадров, проверка поля его пропускает', async () => {
    const photos = await loadPhotos(target.app);
    const items = await loadSeed(target);
    const validate = await validatorOf(target);
    const keys = Object.keys(photos);

    expect(items?.length, `засев ${target.seed}`).toBeGreaterThan(0);

    for (const [index, item] of (items ?? []).entries()) {
      const { photo } = item;

      expect(
        photo === undefined || photo === null || photo === '' || keys.includes(photo),
        `${target.seed}[${index}].photo = ${JSON.stringify(photo)} — пусто или ключ PHOTOS`,
      ).toBe(true);
      expect(await validate(photo), `${target.seed}[${index}].photo проходит проверку поля`).toBe(true);
    }
  });
});
