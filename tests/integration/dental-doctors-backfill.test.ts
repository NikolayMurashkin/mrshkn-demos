import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import resetTestDatabase from './setup';

/**
 * Живой стенд «Клиники»: врачи уже в базе, а новые поля врачей приходят миграцией. Окружение как на сервере без
 * подъема миграций: `NODE_ENV=production` — адаптер не накатывает схему сам, `MIGRATE_ON_START` не задан — миграции
 * идут руками в тесте. Конфиг грузится после смены окружения: он читает флаг миграций при загрузке.
 */
(process.env as Record<string, string>).NODE_ENV = 'production';
delete process.env.MIGRATE_ON_START;

type Migration = {
  name: string;
  up: (args: { db: unknown; payload: Payload; req: unknown }) => Promise<void>;
};

type Accreditation = { kind: string; specialty: string; validUntil: string };

type ScheduleRow = { days: string; hours: string };

type DoctorDoc = {
  id: number;
  slug: string;
  accreditation?: Partial<Accreditation> | null;
  schedule?: ScheduleRow[] | null;
};

type SeedDoctor = {
  slug: string;
  name: string;
  position: string;
  practiceSince: number;
  about: string;
  accreditation?: Accreditation;
  schedule?: ScheduleRow[];
};

type Column = {
  column_name: string;
  is_nullable: 'YES' | 'NO';
  column_default: string | null;
  data_type: string;
  udt_name: string;
};

/** Миграции, которые уже стоят на живой базе до блока сведений по приказу. */
const PREVIOUS_MIGRATIONS = ['20260926_195027_initial', '20260927_114253_clinic_content'];

const CLINIC_TIME_ZONE = 'Europe/Kaliningrad';

const DENTAL_SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

const importDental = async <T>(relative: string): Promise<T> => {
  const file = path.join(DENTAL_SRC, relative);

  expect(existsSync(file), `нет apps/dental/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const dayIn = (iso: string | null | undefined) =>
  typeof iso === 'string'
    ? new Intl.DateTimeFormat('en-CA', {
        timeZone: CLINIC_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(iso))
    : iso;

let payload: Payload;
let client: Client;
let migrations: Migration[];
let seedDoctors: SeedDoctor[];
let idsBefore: { id: number; slug: string }[];
let migrated: Promise<void>;

const drizzle = () => (payload.db as unknown as PostgresAdapter).drizzle;

const doctorIds = async () =>
  (await client.query<{ id: number; slug: string }>('SELECT id, slug FROM doctors ORDER BY id')).rows;

const readDoctor = async (slug: string) => {
  const result = payload.find({ collection: 'doctors', where: { slug: { equals: slug } }, depth: 0, limit: 1 });

  await expect(result, `врач ${slug} читается через Local API`).resolves.toMatchObject({ docs: expect.any(Array) });

  return (await result).docs[0] as unknown as DoctorDoc | undefined;
};

const newMigrations = () => migrations.filter(({ name }) => !PREVIOUS_MIGRATIONS.includes(name));

beforeAll(async () => {
  const url = process.env.DATABASE_URL ?? '';

  client = new Client({ connectionString: url });
  await client.connect();
  await resetTestDatabase();

  const { default: config } = await importDental<{ default: Promise<SanitizedConfig> }>('payload.config.ts');

  ({ migrations } = await importDental<{ migrations: Migration[] }>('migrations/index.ts'));
  ({ DOCTORS: seedDoctors } = await importDental<{ DOCTORS: SeedDoctor[] }>('cms/seed/data.ts'));

  payload = await getPayload({ config, key: 'dental-backfill', disableOnInit: true });

  for (const migration of migrations.filter(({ name }) => PREVIOUS_MIGRATIONS.includes(name))) {
    await migration.up({ db: drizzle(), payload, req: {} });
  }

  const lisitsyna = seedDoctors.find(({ slug }) => slug === 'lisitsyna');

  if (!lisitsyna) {
    throw new Error('в засеве нет врача lisitsyna');
  }

  await drizzle().execute(sql`
    INSERT INTO doctors (name, slug, position, practice_since, about)
    VALUES
      (${lisitsyna.name}, ${lisitsyna.slug}, ${lisitsyna.position}, ${lisitsyna.practiceSince}, ${lisitsyna.about}),
      ('Незнакомцев Петр Петрович', 'stranger', 'Стоматолог', 2001, 'Врач, которого нет в засеве.')
  `);

  idsBefore = await doctorIds();

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

describe('миграция новых полей врачей на базе, где врачи уже есть', () => {
  it('B1: новые миграции проходят на заполненной таблице, ID врачей прежние', async () => {
    expect(
      newMigrations().map(({ name }) => name),
      'миграция новых полей врачей и анкеты',
    ).not.toEqual([]);
    await expect(migrated).resolves.toBeUndefined();
    expect(idsBefore.map(({ slug }) => slug)).toEqual(['lisitsyna', 'stranger']);
    expect(await doctorIds()).toEqual(idsBefore);
  });

  it('B2: врач из засева получил аккредитацию и график засева', async () => {
    await migrated.catch(() => undefined);

    const seed = seedDoctors.find(({ slug }) => slug === 'lisitsyna');

    expect(seed?.accreditation, 'аккредитация lisitsyna в засеве').toEqual({
      kind: expect.any(String),
      specialty: expect.any(String),
      validUntil: expect.any(String),
    });
    expect(seed?.schedule?.length, 'график lisitsyna в засеве').toBeGreaterThan(0);

    const doctor = await readDoctor('lisitsyna');
    const view = (accreditation?: Partial<Accreditation> | null, schedule?: ScheduleRow[] | null) => ({
      kind: accreditation?.kind,
      specialty: accreditation?.specialty,
      day: dayIn(accreditation?.validUntil),
      schedule: schedule?.map(({ days, hours }) => ({ days, hours })),
    });

    expect(view(doctor?.accreditation, doctor?.schedule)).toEqual(view(seed?.accreditation, seed?.schedule));
  });

  it('B3: врач не из засева получил непустые значения, чтение не падает', async () => {
    await migrated.catch(() => undefined);

    const doctor = await readDoctor('stranger');
    const { kind, specialty, validUntil } = doctor?.accreditation ?? {};

    expect(['accreditation', 'certificate'], 'вид документа').toContain(kind);
    expect(typeof specialty, 'специальность').toBe('string');
    expect(specialty?.trim(), 'специальность').not.toBe('');
    expect(typeof validUntil, 'срок действия').toBe('string');
    expect(Number.isNaN(Date.parse(validUntil ?? '')), `срок действия «${validUntil}» — дата`).toBe(false);
    expect(doctor?.schedule?.length, 'график: не меньше одной строки').toBeGreaterThan(0);

    for (const { days, hours } of doctor?.schedule ?? []) {
      expect(days?.trim(), 'дни графика').toBeTruthy();
      expect(hours?.trim(), 'часы графика').toBeTruthy();
    }
  });

  it('B4: после дозаполнения специальность обязательна — врача без нее не вставить', async () => {
    await migrated.catch(() => undefined);

    const { rows: columns } = await client.query<Column>(
      `SELECT column_name, is_nullable, column_default, data_type, udt_name
         FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'doctors'`,
    );
    const specialty = columns.filter(({ column_name }) => column_name.includes('specialty'));

    expect(
      specialty.map(({ column_name }) => column_name),
      'один столбец специальности у doctors',
    ).toHaveLength(1);

    const [target] = specialty;

    if (!target) {
      return;
    }

    /** Остальные обязательные столбцы заполнены: отказ может дать только пропущенная специальность. */
    const filled = columns.filter(
      ({ column_name, is_nullable, column_default }) =>
        is_nullable === 'NO' && column_default === null && column_name !== target.column_name,
    );
    const values = await Promise.all(
      filled.map(async ({ column_name, data_type, udt_name }) => {
        if (column_name === 'slug') {
          return 'b4-doctor';
        }

        if (data_type === 'USER-DEFINED') {
          const { rows } = await client.query<{ label: string }>(
            `SELECT e.enumlabel AS label FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
              WHERE t.typname = $1 ORDER BY e.enumsortorder LIMIT 1`,
            [udt_name],
          );

          return rows[0]?.label;
        }

        if (data_type === 'numeric' || data_type === 'integer') {
          return 2000;
        }

        if (data_type.startsWith('timestamp') || data_type === 'date') {
          return '2030-01-01T10:00:00.000Z';
        }

        return 'B4';
      }),
    );
    const list = filled.map(({ column_name }) => `"${column_name}"`).join(', ');
    const placeholders = filled.map((_, index) => `$${index + 1}`).join(', ');

    await expect(client.query(`INSERT INTO doctors (${list}) VALUES (${placeholders})`, values)).rejects.toThrow(
      `null value in column "${target.column_name}"`,
    );
  });

  it('B5: после миграций таблица анкет есть и пуста', async () => {
    await migrated.catch(() => undefined);

    await expect(payload.count({ collection: 'quality-surveys' as never })).resolves.toEqual({ totalDocs: 0 });
  });
});
