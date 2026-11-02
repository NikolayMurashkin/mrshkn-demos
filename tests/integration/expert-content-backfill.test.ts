import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import resetTestDatabase from './setup';

/** Запросы страниц «Эксперта» берут конфиг по `@payload-config`, а в integration он указывает на шаблон. */
vi.mock('@payload-config', () => import('../../apps/expert/src/payload.config.ts'));

/**
 * Живой стенд «Эксперта»: в базе уже три статьи старого засева без кадров, а засев трогает только пустые коллекции —
 * новые статьи, кадры и поправленные тексты приходят миграцией. Окружение как на сервере без подъема миграций:
 * `NODE_ENV=production` — адаптер не накатывает схему сам, `MIGRATE_ON_START` не задан — миграции идут руками в тесте.
 * Конфиг грузится после смены окружения: он читает флаг миграций при загрузке.
 */
(process.env as Record<string, string>).NODE_ENV = 'production';
delete process.env.MIGRATE_ON_START;

type Migration = {
  name: string;
  up: (args: { db: unknown; payload: Payload; req: unknown }) => Promise<void>;
};

type SeedSection = { title: string; paragraphs: string[] };

type SeedArticle = {
  slug: string;
  title: string;
  publishedAt: string;
  lead: string;
  sections: SeedSection[];
  photo?: string;
};

type SeedFormat = {
  slug: string;
  title: string;
  duration: number;
  place: string;
  price: number;
  summary: string;
};

type SeedReview = { author: string; text: string; subject?: string };

type SeedModule = { ARTICLES: SeedArticle[]; FORMATS: SeedFormat[]; REVIEWS?: SeedReview[] };

type LexicalNode = { type: string; tag?: string; text?: string; children?: LexicalNode[] };

type ArticleRow = { slug: string; title: string; lead: string; photo: string | null; content: unknown };

/** Миграции, которые уже стоят на стенде до блока: схема статей с полем кадра. */
const PREVIOUS_MIGRATIONS = ['20260926_195027_initial', '20261010_212515_expert_content', '20261102_131652_photo'];

/** Статьи старого засева — они уже на стенде. */
const OLD_SLUGS = ['night-anxiety', 'first-session', 'psychologist-or-psychiatrist'];

const OLD_SUMMARY = 'Основной формат работы. Обычно раз в неделю, первые изменения — через 6–10 встреч.';

const NEW_SUMMARY =
  'Основной формат работы, обычно раз в неделю. Сколько понадобится встреч, зависит от запроса: раз в несколько встреч мы сверяемся, движемся ли к цели.';

const OLD_HEADING = 'Первые 50 минут';

const NEW_HEADING = 'На встрече';

const ADMIN_TITLE = 'Тревога ночью: заголовок из админки';

const ADMIN_LEAD = 'Лид, который поправили в админке.';

const ADMIN_SUMMARY = 'Описание формата, которое поправили в админке.';

const EXPERT_SRC = path.resolve(import.meta.dirname, '../../apps/expert/src');

/** Модуль демо «Эксперт»: пока файла нет, тест падает на assert, а не на сборке файла. */
const importExpert = async <T>(relative: string): Promise<T> => {
  const file = path.join(EXPERT_SRC, relative);

  expect(existsSync(file), `нет apps/expert/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let config: Promise<SanitizedConfig>;
let migrations: Migration[];
let seed: SeedModule;
let lexicalFromSections: (sections: SeedSection[]) => unknown;
let seedExpert: (payload: Payload) => Promise<void>;

/** Стенд со старым засевом после новых миграций: его прежние тексты сверяет сценарий правок из админки. */
let oldStand: { summary?: string; firstSession?: unknown } = {};

const seedArticle = (slug: string) => {
  const found = seed.ARTICLES.find((article) => article.slug === slug);

  if (!found) {
    throw new Error(`в засеве нет статьи ${slug}`);
  }

  return found;
};

/** Разделы статьи в том виде, в каком они стоят на стенде: у первой встречи — прежний заголовок раздела. */
const oldSections = (article: SeedArticle) =>
  article.sections.map((section) =>
    article.slug === 'first-session' && section.title === NEW_HEADING ? { ...section, title: OLD_HEADING } : section,
  );

const textOf = (node: LexicalNode): string =>
  node.type === 'text' ? (node.text ?? '') : (node.children ?? []).map(textOf).join('');

/** Текст статьи по блокам: тип, тег и текст каждого узла верхнего уровня. */
const outlineOf = (content: unknown) =>
  ((content as { root?: { children?: LexicalNode[] } })?.root?.children ?? []).map((node) => ({
    type: node.type,
    tag: node.tag,
    text: textOf(node),
  }));

/** Стенд со своим Payload: схема до блока, затем данные стенда, затем новые миграции — один раз на сценарий. */
const createStand = (key: string) => {
  const stand = {
    payload: undefined as unknown as Payload,
    client: undefined as unknown as Client,
    migrated: Promise.resolve(),
  };

  const drizzle = () => (stand.payload.db as unknown as PostgresAdapter).drizzle;

  const run = async (names: (name: string) => boolean) => {
    for (const migration of migrations.filter(({ name }) => names(name))) {
      await migration.up({ db: drizzle(), payload: stand.payload, req: {} });
    }
  };

  return {
    stand,
    drizzle,
    open: async () => {
      await resetTestDatabase();
      stand.client = new Client({ connectionString: process.env.DATABASE_URL ?? '' });
      await stand.client.connect();
      stand.payload = await getPayload({ config, key, disableOnInit: true });
    },
    previous: () => run((name) => PREVIOUS_MIGRATIONS.includes(name)),
    /** Новые миграции идут один раз; сценарии ждут их и читают базу после. */
    next: () => {
      stand.migrated = run((name) => !PREVIOUS_MIGRATIONS.includes(name));
      stand.migrated.catch(() => undefined);
    },
    all: () => {
      stand.migrated = run(() => true);
      stand.migrated.catch(() => undefined);
    },
    close: async () => {
      await stand.payload?.destroy();
      await stand.client?.end();
      await resetTestDatabase();
    },
  };
};

/** Статья старого засева прямо в таблицу: Local API проверил бы ключ кадра по карте, которой еще может не быть. */
const insertArticle = async (
  drizzle: () => PostgresAdapter['drizzle'],
  article: SeedArticle,
  { title = article.title, lead = article.lead, photo = null as string | null } = {},
) => {
  const content = JSON.stringify(lexicalFromSections(oldSections(article)));

  await drizzle().execute(sql`
    INSERT INTO articles (title, slug, published_at, lead, photo, content)
    VALUES (${title}, ${article.slug}, ${article.publishedAt}, ${lead}, ${photo}, ${content}::jsonb)
  `);
};

/** Форматы старого засева; у индивидуальной сессии — заданное описание. */
const insertFormats = async (payload: Payload, individualSummary: string) => {
  for (const format of seed.FORMATS) {
    await payload.create({
      collection: 'formats' as never,
      data: (format.slug === 'individual' ? { ...format, summary: individualSummary } : format) as never,
    });
  }
};

const readArticles = async (client: Client) =>
  (
    await client.query<ArticleRow>(
      'SELECT slug, title, lead, photo, content FROM articles ORDER BY published_at DESC, slug',
    )
  ).rows;

const readSummary = async (client: Client, slug: string) =>
  (await client.query<{ summary: string }>('SELECT summary FROM formats WHERE slug = $1', [slug])).rows[0]?.summary;

beforeAll(async () => {
  ({ default: config } = await importExpert<{ default: Promise<SanitizedConfig> }>('payload.config.ts'));
  ({ migrations } = await importExpert<{ migrations: Migration[] }>('migrations/index.ts'));
  seed = await importExpert<SeedModule>('cms/seed/data.ts');
  ({ lexicalFromSections } = await importExpert<{ lexicalFromSections: (sections: SeedSection[]) => unknown }>(
    'cms/seed/lexical.ts',
  ));
  ({ seedExpert } = await importExpert<{ seedExpert: (payload: Payload) => Promise<void> }>('cms/seed/seed.ts'));
});

describe('стенд со старым засевом: три статьи без кадров, прежние тексты', () => {
  const { stand, drizzle, open, previous, next, close } = createStand('expert-backfill-old');

  beforeAll(async () => {
    await open();
    await previous();

    for (const slug of OLD_SLUGS) {
      await insertArticle(drizzle, seedArticle(slug));
    }

    await insertFormats(stand.payload, OLD_SUMMARY);
    next();
    await stand.migrated.catch(() => undefined);

    oldStand = {
      summary: await readSummary(stand.client, 'individual'),
      firstSession: (await readArticles(stand.client)).find(({ slug }) => slug === 'first-session')?.content,
    };
  });

  afterAll(close);

  it('M1: стенд: 3 старые статьи без photo → 6 статей, у всех photo', async () => {
    await expect(stand.migrated).resolves.toBeUndefined();

    const rows = await readArticles(stand.client);
    const expected = Object.fromEntries(seed.ARTICLES.map(({ slug, photo }) => [slug, photo]));

    expect(rows, 'статей на стенде').toHaveLength(6);
    expect(rows.map(({ slug }) => slug).sort()).toEqual(seed.ARTICLES.map(({ slug }) => slug).sort());

    for (const { slug, photo } of rows) {
      expect(expected[slug], `${slug}: ключ кадра в ARTICLES`).toEqual(expect.any(String));
      expect(photo, `${slug}.photo`).toBe(expected[slug]);
    }
  });
});

describe('стенд с правками из админки', () => {
  const { stand, drizzle, open, previous, next, close } = createStand('expert-backfill-admin');

  /** Ключ кадра другой статьи: редактор уже поставил его вручную. */
  let otherKey: string | null;

  beforeAll(async () => {
    await open();
    await previous();

    otherKey = seed.ARTICLES.find(({ slug }) => slug === 'burnout-signs')?.photo ?? null;

    await insertArticle(drizzle, seedArticle('night-anxiety'), { title: ADMIN_TITLE, lead: ADMIN_LEAD });
    await insertArticle(drizzle, seedArticle('psychologist-or-psychiatrist'), { photo: otherKey });
    /** Пустой кадр пустой строкой, не `NULL`: так его оставляет очищенное поле; `NULL` держит стенд со старым засевом. */
    await insertArticle(drizzle, seedArticle('first-session'), { photo: '' });
    await insertFormats(stand.payload, ADMIN_SUMMARY);
    next();
  });

  afterAll(close);

  it('M2: стенд: правки из админки не перезаписываются', async () => {
    await expect(stand.migrated).resolves.toBeUndefined();

    const rows = await readArticles(stand.client);
    const bySlug = (slug: string) => rows.find((row) => row.slug === slug);

    expect(bySlug('first-session')?.photo, 'пустой кадр заполнен').toEqual(expect.any(String));
    expect(otherKey, 'ключ кадра статьи burnout-signs в ARTICLES').toEqual(expect.any(String));
    expect(otherKey, 'ключ другой статьи, не свой').not.toBe(seedArticle('psychologist-or-psychiatrist').photo);
    expect(bySlug('night-anxiety')?.title, 'заголовок из админки').toBe(ADMIN_TITLE);
    expect(bySlug('night-anxiety')?.lead, 'лид из админки').toBe(ADMIN_LEAD);
    expect(bySlug('psychologist-or-psychiatrist')?.photo, 'кадр, поставленный в админке').toBe(otherKey);
    expect(seedArticle('first-session').photo, 'ключ кадра first-session в ARTICLES').toEqual(expect.any(String));
    expect(bySlug('first-session')?.photo, 'пустой кадр заполнен').toBe(seedArticle('first-session').photo);
  });

  it('M5: стенд: старые тексты формата и статьи обновлены, правки из админки — нет', async () => {
    await stand.migrated.catch(() => undefined);

    const individual = seed.FORMATS.find(({ slug }) => slug === 'individual');
    const before = outlineOf(lexicalFromSections(oldSections(seedArticle('first-session'))));
    const expected = before.map((node) =>
      node.type === 'heading' && node.text === OLD_HEADING ? { ...node, text: NEW_HEADING } : node,
    );

    expect(oldStand.summary, 'прежнее описание на стенде заменено').toBe(NEW_SUMMARY);
    expect(individual?.summary, 'описание индивидуальной сессии в FORMATS').toBe(NEW_SUMMARY);
    expect(
      before.filter(({ text }) => text === OLD_HEADING),
      'на стенде раздел «Первые 50 минут»',
    ).toHaveLength(1);
    expect(outlineOf(oldStand.firstSession), 'текст статьи first-session после миграции').toEqual(expected);
    expect(await readSummary(stand.client, 'individual'), 'описание из админки').toBe(ADMIN_SUMMARY);
  });
});

describe('чистая база: миграции и засев', () => {
  const { stand, open, all, close } = createStand('expert-backfill-clean');

  const counts = async () => ({
    articles: (await stand.payload.count({ collection: 'articles' as never })).totalDocs,
    reviews: (await stand.payload.count({ collection: 'reviews' as never })).totalDocs,
  });

  beforeAll(async () => {
    await open();
    all();
  });

  afterAll(close);

  it('M3: чистая база: миграции + засев — ровно 6 статей без дублей и отзывы', async () => {
    await expect(stand.migrated).resolves.toBeUndefined();
    await expect(seedExpert(stand.payload)).resolves.toBeUndefined();

    const rows = await readArticles(stand.client);
    const slugs = rows.map(({ slug }) => slug);
    const reviews = seed.REVIEWS ?? [];

    expect(rows, 'статей после засева').toHaveLength(6);
    expect(new Set(slugs).size, 'слаги без повторов').toBe(slugs.length);
    expect([...slugs].sort()).toEqual(seed.ARTICLES.map(({ slug }) => slug).sort());

    for (const { slug, photo } of rows) {
      expect(photo, `${slug}.photo`).toEqual(expect.any(String));
      expect(photo, `${slug}.photo — ключ из ARTICLES`).toBe(seedArticle(slug).photo);
    }

    expect(reviews.length, 'REVIEWS в засеве').toBeGreaterThan(0);
    await expect(stand.payload.count({ collection: 'reviews' as never }), 'отзывы после засева').resolves.toEqual({
      totalDocs: reviews.length,
    });
  });

  it('M4: повторный старт ничего не дублирует', async () => {
    await stand.migrated.catch(() => undefined);

    const reviews = seed.REVIEWS ?? [];

    expect(reviews.length, 'REVIEWS в засеве').toBeGreaterThan(0);
    await expect(seedExpert(stand.payload)).resolves.toBeUndefined();
    await expect(counts(), 'статьи и отзывы после второго засева').resolves.toEqual({
      articles: 6,
      reviews: reviews.length,
    });
  });

  it('G1: getReviews — отзывы засева в порядке REVIEWS', async () => {
    await stand.migrated.catch(() => undefined);

    const { getReviews } = await importExpert<{ getReviews: () => Promise<SeedReview[]> }>('cms/queries.ts');
    const reviews = seed.REVIEWS ?? [];

    expect(reviews.length, 'REVIEWS в засеве').toBeGreaterThan(0);

    try {
      expect((await getReviews()).map(({ author }) => author)).toEqual(reviews.map(({ author }) => author));
    } finally {
      await (await getPayload({ config })).destroy();
    }
  });
});
