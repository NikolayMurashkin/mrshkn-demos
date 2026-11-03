import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import resetTestDatabase from './setup';

/**
 * Живой стенд «Клиники»: врачи старого засева уже в базе, столбец кадра пуст, а засев трогает только пустую
 * коллекцию — ключи портретов приходят миграцией. Окружение как на сервере без подъема миграций:
 * `NODE_ENV=production` — адаптер не накатывает схему сам, `MIGRATE_ON_START` не задан — миграции идут руками
 * в тесте. Конфиг грузится после смены окружения: он читает флаг миграций при загрузке.
 */
(process.env as Record<string, string>).NODE_ENV = 'production';
delete process.env.MIGRATE_ON_START;

type Migration = {
  name: string;
  up: (args: { db: unknown; payload: Payload; req: unknown }) => Promise<void>;
};

type SeedDoctor = {
  slug: string;
  name: string;
  position: string;
  practiceSince: number;
  about: string;
  accreditation: { kind: string; specialty: string; validUntil: string };
  photo?: string;
};

/** Миграции, которые уже стоят на стенде до портретов: врачи с документами и пустой столбец кадра. */
const PREVIOUS_MIGRATIONS = [
  '20260926_195027_initial',
  '20260927_114253_clinic_content',
  '20261026_125503_doctor_documents_surveys',
  '20261102_131650_photo',
];

/** Врач, которого нет в засеве: его добавили в админке. */
const STRANGER = { slug: 'stranger', name: 'Незнакомцев Петр Петрович', position: 'Стоматолог' };

const DENTAL_SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

const importDental = async <T>(relative: string): Promise<T> => {
  const file = path.join(DENTAL_SRC, relative);

  expect(existsSync(file), `нет apps/dental/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let payload: Payload;
let client: Client;
let migrations: Migration[];
let seedDoctors: SeedDoctor[];
let idsBefore: { id: number; slug: string }[];
let migrated: Promise<void>;

const drizzle = () => (payload.db as unknown as PostgresAdapter).drizzle;

const newMigrations = () => migrations.filter(({ name }) => !PREVIOUS_MIGRATIONS.includes(name));

const runNewMigrations = async () => {
  for (const migration of newMigrations()) {
    await migration.up({ db: drizzle(), payload, req: {} });
  }
};

const doctorPhotos = async () =>
  (
    await client.query<{ id: number; slug: string; photo: string | null }>(
      'SELECT id, slug, photo FROM doctors ORDER BY id',
    )
  ).rows;

const photoOf = async (slug: string) =>
  (await client.query<{ photo: string | null }>('SELECT photo FROM doctors WHERE slug = $1', [slug])).rows[0]?.photo;

beforeAll(async () => {
  client = new Client({ connectionString: process.env.DATABASE_URL ?? '' });
  await client.connect();
  await resetTestDatabase();

  const { default: config } = await importDental<{ default: Promise<SanitizedConfig> }>('payload.config.ts');

  ({ migrations } = await importDental<{ migrations: Migration[] }>('migrations/index.ts'));
  ({ DOCTORS: seedDoctors } = await importDental<{ DOCTORS: SeedDoctor[] }>('cms/seed/data.ts'));

  payload = await getPayload({ config, key: 'dental-photo-backfill', disableOnInit: true });

  for (const migration of migrations.filter(({ name }) => PREVIOUS_MIGRATIONS.includes(name))) {
    await migration.up({ db: drizzle(), payload, req: {} });
  }

  /** Врачи старого засева: кадра нет — у одних NULL, у других пустая строка после правки в админке. */
  for (const [index, doctor] of seedDoctors.entries()) {
    await drizzle().execute(sql`
      INSERT INTO doctors
        (name, slug, position, practice_since, about, accreditation_specialty, accreditation_valid_until, photo)
      VALUES
        (${doctor.name}, ${doctor.slug}, ${doctor.position}, ${doctor.practiceSince}, ${doctor.about},
         ${doctor.accreditation.specialty}, ${doctor.accreditation.validUntil}, ${index % 2 === 0 ? null : ''})
    `);
  }

  await drizzle().execute(sql`
    INSERT INTO doctors
      (name, slug, position, practice_since, about, accreditation_specialty, accreditation_valid_until)
    VALUES
      (${STRANGER.name}, ${STRANGER.slug}, ${STRANGER.position}, 2001, 'Врач, которого нет в засеве.',
       ${STRANGER.position}, '2030-01-01T10:00:00.000Z')
  `);

  idsBefore = (await doctorPhotos()).map(({ id, slug }) => ({ id, slug }));

  /** Новые миграции идут один раз; сценарии ниже читают базу после них. */
  migrated = runNewMigrations();
  migrated.catch(() => undefined);
});

afterAll(async () => {
  await payload?.destroy();
  await client?.end();
  await resetTestDatabase();
});

describe('ключи портретов врачей на стенде, где врачи уже засеяны', () => {
  it('P1: новые миграции проходят на заполненной таблице, врачей столько же, ID прежние', async () => {
    expect(
      newMigrations().map(({ name }) => name),
      'миграция ключей портретов врачей',
    ).not.toEqual([]);
    await expect(migrated).resolves.toBeUndefined();
    expect(idsBefore).toHaveLength(seedDoctors.length + 1);
    expect((await doctorPhotos()).map(({ id, slug }) => ({ id, slug }))).toEqual(idsBefore);
  });

  it('P2: каждый врач засева с пустым кадром (NULL или пустая строка) получает ключ засева', async () => {
    await migrated.catch(() => undefined);

    expect(seedDoctors, 'врачей в засеве').toHaveLength(7);

    for (const { slug, photo } of seedDoctors) {
      expect(photo, `кадр ${slug} в засеве`).toBeTruthy();
      expect(await photoOf(slug), `кадр ${slug} после миграции`).toBe(photo);
    }
  });

  it('P3: врач не из засева не тронут', async () => {
    await migrated.catch(() => undefined);

    expect(seedDoctors.some(({ slug }) => slug === STRANGER.slug)).toBe(false);
    expect(await photoOf(STRANGER.slug)).toBeNull();
  });

  it('P4: портреты читаются через Local API', async () => {
    await migrated.catch(() => undefined);

    const [first] = seedDoctors;
    const { docs } = await payload.find({
      collection: 'doctors',
      where: { slug: { equals: first?.slug } },
      depth: 0,
      limit: 1,
    });

    expect((docs[0] as unknown as { photo?: string } | undefined)?.photo).toBe(first?.photo);
  });

  it('P5: повторный прогон не меняет ничего, кадр, выбранный в админке, остается прежним', async () => {
    await migrated.catch(() => undefined);

    const [chosen, other] = seedDoctors;

    if (!chosen?.photo || !other?.photo) {
      throw new Error('в засеве меньше двух врачей с кадром');
    }

    /** В админке врачу поставили чужой кадр из карты — заполненное поле миграция не перетирает. */
    await client.query('UPDATE doctors SET photo = $1 WHERE slug = $2', [other.photo, chosen.slug]);

    const before = await doctorPhotos();

    expect(before.find(({ slug }) => slug === chosen.slug)?.photo).toBe(other.photo);
    await expect(runNewMigrations()).resolves.toBeUndefined();
    expect(await doctorPhotos()).toEqual(before);
  });
});
