import type {} from '@payloadcms/db-postgres';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { generateKeyBetween } from 'payload/shared';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import resetTestDatabase from './setup';

/**
 * Чтение меню обязано брать Payload из аргумента. В интеграционных тестах `@payload-config` указывает на конфиг
 * шаблона: функция, которая берет конфиг сама, подняла бы второй Payload со схемой шаблона на базе «Кофейни»
 * (push схемы спросил бы в терминале о потере данных). Поэтому глобальный конфиг здесь непригоден: ленивое
 * обещание падает, только если его кто-то ждет.
 */
vi.mock('@payload-config', () => ({
  default: {
    then: (_resolve: unknown, reject: (error: Error) => void) =>
      reject(new Error('getMenuItems взяла глобальный конфиг Payload, а не переданный payload')),
  },
}));

type MenuItem = {
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
};

type MenuItemDoc = MenuItem & { id: number | string; _order: string };

const MENU_ITEM_FIELDS = ['slug', 'name', 'description', 'price', 'category', 'tags'];

const COLLECTION = 'menu-items';

const COFFEE_SRC = path.resolve(import.meta.dirname, '../../apps/coffee/src');

/** Модуль демо «Кофейня»: пока его нет, тест падает на assert, а не на сборке файла. */
const importCoffee = async <T>(relative: string): Promise<T> => {
  const file = path.join(COFFEE_SRC, relative);

  expect(existsSync(file), `нет apps/coffee/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let getMenuItems: (payload: Payload) => Promise<MenuItem[]>;
let seedCoffee: (payload: Payload) => Promise<void>;
let MENU_ITEMS: MenuItem[];

let payload: Payload;

const menuDocs = async () =>
  (await payload.find({ collection: COLLECTION as never, sort: '_order', limit: 0, depth: 0 }))
    .docs as unknown as MenuItemDoc[];

const menuCount = async () => (await payload.count({ collection: COLLECTION as never })).totalDocs;

const deleteMenu = async (where: Record<string, unknown>) => {
  await payload.delete({ collection: COLLECTION as never, where: where as never });
};

/** Меню через проверяемую функцию: промис, отклоненный вместо списка, — нарушение контракта, а не сбой теста. */
const readMenu = async () => {
  const result = getMenuItems(payload);

  await expect(result, 'getMenuItems(payload) отдает список позиций').resolves.toBeInstanceOf(Array);

  return result;
};

/**
 * У шаблона и «Кофейни» разные схемы, а база интеграционных тестов одна: файл начинает и заканчивает на пустой
 * схеме, чтобы Payload соседнего файла не спрашивал в терминале о потере данных.
 */
beforeAll(async () => {
  const { default: config } = await importCoffee<{ default: Promise<SanitizedConfig> }>('payload.config.ts');

  ({ getMenuItems } = await importCoffee<{ getMenuItems: typeof getMenuItems }>('cms/queries.ts'));
  ({ seedCoffee } = await importCoffee<{ seedCoffee: typeof seedCoffee }>('cms/seed/seed.ts'));
  ({ MENU_ITEMS } = await importCoffee<{ MENU_ITEMS: MenuItem[] }>('cms/seed/data.ts'));

  await resetTestDatabase();
  payload = await getPayload({ config, key: 'coffee-seed' });
});

afterAll(async () => {
  await payload?.destroy();
  await resetTestDatabase();
});

describe('засев меню «Кофейни»', () => {
  it('S2: старт на пустой базе засевает все позиции в порядке засева', async () => {
    expect(await menuCount()).toBe(MENU_ITEMS.length);
    expect((await menuDocs()).map(({ slug }) => slug)).toEqual(MENU_ITEMS.map(({ slug }) => slug));
  });

  it('S3: повторный засев ничего не дублирует', async () => {
    await seedCoffee(payload);

    const slugs = (await menuDocs()).map(({ slug }) => slug);

    expect(await menuCount()).toBe(MENU_ITEMS.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('S4: засев не дописывает в непустую коллекцию', async () => {
    const [kept] = MENU_ITEMS;

    await deleteMenu({ slug: { not_equals: kept?.slug } });

    expect(await menuCount(), 'перед засевом осталась одна позиция').toBe(1);

    await seedCoffee(payload);

    expect(await menuCount()).toBe(1);
    expect((await menuDocs()).map(({ slug }) => slug)).toEqual([kept?.slug]);
  });
});

describe('чтение меню из CMS — getMenuItems(payload)', () => {
  /** Чтение проверяется на полном меню: коллекция очищается и засевается заново. */
  beforeAll(async () => {
    await deleteMenu({ id: { exists: true } });
    await seedCoffee(payload);
  });

  it('G1: все позиции, больше лимита Payload по умолчанию', async () => {
    expect(MENU_ITEMS.length, 'засев длиннее страницы Payload по умолчанию (10)').toBeGreaterThan(10);
    expect(await menuCount(), 'меню засеяно заново').toBe(MENU_ITEMS.length);

    expect(await readMenu()).toHaveLength(MENU_ITEMS.length);
  });

  it('G2: позиции — ровно поля MenuItem, как в засеве; без описания — undefined, без признаков — []', async () => {
    const items = await readMenu();

    expect(items).toEqual(MENU_ITEMS);

    for (const item of items) {
      expect(
        Object.keys(item).filter((key) => !MENU_ITEM_FIELDS.includes(key)),
        `лишние поля у ${item.slug}`,
      ).toEqual([]);
    }

    const withoutTags = MENU_ITEMS.filter(({ tags }) => tags.length === 0).map(({ slug }) => slug);

    expect(withoutTags.length, 'в засеве есть позиция без признаков').toBeGreaterThan(0);

    for (const slug of withoutTags) {
      expect(items.find((item) => item.slug === slug)?.tags, slug).toEqual([]);
    }

    // В засеве у каждой позиции есть описание: позицию без описания делаем правкой, как из админки.
    // Порядок и состав меню правка не меняет — следующему сценарию она не мешает.
    const [doc] = await menuDocs();

    expect(doc, 'меню не пустое').toBeDefined();

    if (!doc) {
      return;
    }

    await payload.update({ collection: COLLECTION as never, id: doc.id, data: { description: null } as never });

    const cleared = (await readMenu()).find((item) => item.slug === doc.slug);

    expect(cleared, doc.slug).toBeDefined();
    expect(cleared?.description, `${doc.slug}: описание без значения`).toBeUndefined();
  });

  it('G3: позиция, переставленная в начало через _order, идет первой, остальные — в прежнем порядке', async () => {
    const docs = await menuDocs();
    const first = docs[0];
    const moved = docs.at(-1);

    expect(first?._order, 'ключ порядка первой позиции').toEqual(expect.any(String));
    expect(moved, 'в меню больше одной позиции').not.toBe(first);

    if (!first || !moved) {
      return;
    }

    await payload.update({
      collection: COLLECTION as never,
      id: moved.id,
      data: { _order: generateKeyBetween(null, first._order) } as never,
    });

    const slugs = docs.map(({ slug }) => slug);

    expect((await readMenu()).map(({ slug }) => slug)).toEqual([moved.slug, ...slugs.slice(0, -1)]);
  });
});
