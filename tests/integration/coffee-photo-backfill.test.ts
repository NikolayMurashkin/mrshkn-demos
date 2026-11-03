import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import resetTestDatabase from './setup';

/**
 * Живой стенд «Кофейни»: меню старого засева уже в базе, столбец кадра пуст, а засев трогает только пустую
 * коллекцию — ключи кадров приходят миграцией. Окружение как на сервере без подъема миграций: `NODE_ENV=production` —
 * адаптер не накатывает схему сам, `MIGRATE_ON_START` не задан — миграции идут руками в тесте. Конфиг грузится после
 * смены окружения: он читает флаг миграций при загрузке.
 */
(process.env as Record<string, string>).NODE_ENV = 'production';
delete process.env.MIGRATE_ON_START;

type Migration = {
  name: string;
  up: (args: { db: unknown; payload: Payload; req: unknown }) => Promise<void>;
};

type SeedItem = { slug: string; name: string; price: number; category: string; photo?: string };

/** Миграции, которые уже стоят на стенде до кадров меню: схема меню и пустой столбец кадра. */
const PREVIOUS_MIGRATIONS = ['20260926_195027_initial', '20261010_223750_menu', '20261102_131655_photo'];

/** Кадр, выбранный в админке вместо кадра засева. */
const ADMIN_PHOTO = 'flat-white';

/** Позиция, которой нет в засеве: ее добавили в админке. */
const STRANGER = { slug: 'house-lemonade', name: 'Домашний лимонад', price: 250, category: 'tea' };

const COFFEE_SRC = path.resolve(import.meta.dirname, '../../apps/coffee/src');

const importCoffee = async <T>(relative: string): Promise<T> => {
  const file = path.join(COFFEE_SRC, relative);

  expect(existsSync(file), `нет apps/coffee/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let payload: Payload;
let client: Client;
let migrations: Migration[];
let seedItems: SeedItem[];
let migrated: Promise<void>;

const drizzle = () => (payload.db as unknown as PostgresAdapter).drizzle;

const photoOf = async (slug: string) =>
  (await client.query<{ photo: string | null }>('SELECT photo FROM menu_items WHERE slug = $1', [slug])).rows[0]?.photo;

const newMigrations = () => migrations.filter(({ name }) => !PREVIOUS_MIGRATIONS.includes(name));

const seedItem = (slug: string) => {
  const item = seedItems.find((candidate) => candidate.slug === slug);

  if (!item) {
    throw new Error(`в засеве нет позиции ${slug}`);
  }

  return item;
};

beforeAll(async () => {
  client = new Client({ connectionString: process.env.DATABASE_URL ?? '' });
  await client.connect();
  await resetTestDatabase();

  const { default: config } = await importCoffee<{ default: Promise<SanitizedConfig> }>('payload.config.ts');

  ({ migrations } = await importCoffee<{ migrations: Migration[] }>('migrations/index.ts'));
  ({ MENU_ITEMS: seedItems } = await importCoffee<{ MENU_ITEMS: SeedItem[] }>('cms/seed/data.ts'));

  payload = await getPayload({ config, key: 'coffee-photo-backfill', disableOnInit: true });

  for (const migration of migrations.filter(({ name }) => PREVIOUS_MIGRATIONS.includes(name))) {
    await migration.up({ db: drizzle(), payload, req: {} });
  }

  const espresso = seedItem('espresso');
  const americano = seedItem('americano');
  const cappuccino = seedItem('cappuccino');

  await drizzle().execute(sql`
    INSERT INTO menu_items (name, slug, price, category, photo)
    VALUES
      (${espresso.name}, ${espresso.slug}, ${espresso.price}, ${espresso.category}, NULL),
      (${americano.name}, ${americano.slug}, ${americano.price}, ${americano.category}, ''),
      (${cappuccino.name}, ${cappuccino.slug}, ${cappuccino.price}, ${cappuccino.category}, ${ADMIN_PHOTO}),
      (${STRANGER.name}, ${STRANGER.slug}, ${STRANGER.price}, ${STRANGER.category}, NULL)
  `);

  /** Новые миграции идут один раз; сценарии ниже читают базу после них. */
  migrated = (async () => {
    for (const migration of newMigrations()) {
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

describe('ключи кадров меню на стенде, где меню уже засеяно', () => {
  it('K1: новые миграции проходят на заполненном меню, позиций столько же', async () => {
    expect(
      newMigrations().map(({ name }) => name),
      'миграция ключей кадров меню',
    ).not.toEqual([]);
    await expect(migrated).resolves.toBeUndefined();

    const { rows } = await client.query<{ slug: string }>('SELECT slug FROM menu_items ORDER BY id');

    expect(rows.map(({ slug }) => slug)).toEqual(['espresso', 'americano', 'cappuccino', STRANGER.slug]);
  });

  it('K2: позиция засева с пустым кадром (NULL или пустая строка) получает ключ засева', async () => {
    await migrated.catch(() => undefined);

    expect(seedItem('espresso').photo, 'кадр эспрессо в засеве').toBeTruthy();
    expect(seedItem('americano').photo, 'кадр американо в засеве').toBeTruthy();
    expect(await photoOf('espresso')).toBe(seedItem('espresso').photo);
    expect(await photoOf('americano')).toBe(seedItem('americano').photo);
  });

  it('K3: кадр, выбранный в админке, остается прежним', async () => {
    await migrated.catch(() => undefined);

    expect(seedItem('cappuccino').photo, 'у капучино в засеве другой кадр').not.toBe(ADMIN_PHOTO);
    expect(await photoOf('cappuccino')).toBe(ADMIN_PHOTO);
  });

  it('K4: позиция не из засева не тронута', async () => {
    await migrated.catch(() => undefined);

    expect(seedItems.some(({ slug }) => slug === STRANGER.slug)).toBe(false);
    expect(await photoOf(STRANGER.slug)).toBeNull();
  });

  it('K5: кадры читаются через Local API', async () => {
    await migrated.catch(() => undefined);

    const { docs } = await payload.find({
      collection: 'menu-items' as never,
      where: { slug: { equals: 'espresso' } },
      depth: 0,
      limit: 1,
    });

    expect((docs[0] as unknown as { photo?: string } | undefined)?.photo).toBe(seedItem('espresso').photo);
  });
});
