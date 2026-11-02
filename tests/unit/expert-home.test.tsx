/** @vitest-environment happy-dom */
import { isReviewAuthor } from '@mrshkn/demo-core/cms/reviews';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type SeedSection = { title: string; paragraphs: string[] };

type LexicalState = { root: { children: unknown[] } };

type Article = {
  id: number;
  slug: string;
  title: string;
  lead: string;
  publishedAt: string;
  photo?: string | null;
  content: LexicalState;
  updatedAt: string;
  createdAt: string;
};

type Review = { author: string; text: string; subject?: string };

type ImageData = { src: string; width: number; height: number };

type ArticleModule = {
  latestArticles: <T extends { publishedAt: string }>(articles: T[], count: number) => T[];
};

type CoverKind = 'lead' | 'single' | 'side' | 'row';

type CoverModule = { coverSizes: (index: number, total: number) => string };

type ConstsModule = { ARTICLE_COVER_SIZES: Record<CoverKind, string> };

type PageModule = { default: () => ReactNode | Promise<ReactNode> };

type PortraitModule = { Portrait: () => ReactNode };

type ArticleListModule = { ArticleList: (props: { articles: Article[] }) => ReactNode };

type LexicalModule = { lexicalFromSections: (sections: SeedSection[]) => LexicalState };

type SeedModule = { REVIEWS?: Review[] };

/** Данные запросов CMS и карта кадров — от теста: страница отрисовывается без базы и без файлов картинок. */
const cms = vi.hoisted(() => ({
  articles: [] as unknown[],
  reviews: [] as unknown[],
}));

/** Ключи кадров «Эксперта»: портрет и обложка каждой статьи засева. */
const PHOTO_KEYS = vi.hoisted(() => [
  'portrait',
  'article-night-anxiety',
  'article-first-session',
  'article-psychologist-or-psychiatrist',
  'article-burnout-signs',
  'article-couple-conflicts',
  'article-self-criticism',
]);

vi.mock('../../apps/expert/src/cms/queries.ts', () => ({
  getArticles: async () => cms.articles,
  getReviews: async () => cms.reviews,
  getFormats: async () => [],
  getArticle: async () => null,
}));

/** Тот же объект, что дает статический импорт картинки в Next: импорт `.jpg` в unit не грузится. */
vi.mock('../../apps/expert/src/assets/photos/index.ts', () => ({
  PHOTOS: Object.fromEntries(
    PHOTO_KEYS.map((key) => [key, { src: `/_next/static/media/${key}.0a1b2c3d.jpg`, width: 1600, height: 1200 }]),
  ) as Record<string, ImageData>,
}));

const EXPERT_SRC = path.resolve(import.meta.dirname, '../../apps/expert/src');

/** Модуль демо «Эксперт»: нет файла — тест падает на assert, а не на сборке. */
const importExpert = async <T,>(relative: string): Promise<T> => {
  const file = path.join(EXPERT_SRC, relative);

  expect(existsSync(file), `нет apps/expert/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

/** Текст с обычными пробелами вместо неразрывных: типограф ставит их по-своему. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Разметка целиком, с асинхронными компонентами внутри: блок страницы может сам ждать данные. */
const renderBody = async (node: ReactNode) => {
  const { prelude } = await prerender(<>{node}</>);
  const markup = await new Response(prelude).text();

  return new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;
};

const renderHome = async () => {
  const { default: HomePage } = await importExpert<PageModule>('app/(site)/(plate)/page.tsx');

  return renderBody(await HomePage());
};

const ARTICLES_TITLE = 'Статьи';

const ALL_ARTICLES = 'Все статьи';

const REVIEWS_TITLE = 'Отзывы';

const headingsWith = (body: HTMLElement, title: string) =>
  [...body.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((heading) => plain(heading.textContent) === title);

/** Блок с заголовком `h2`: ближайший предок заголовка, в котором есть список. */
const blockOf = (body: HTMLElement, title: string) => {
  const headings = [...body.querySelectorAll('h2')].filter((heading) => plain(heading.textContent) === title);

  expect(headings, `ровно один заголовок h2 «${title}» на главной`).toHaveLength(1);

  let block = headings[0]?.parentElement ?? null;

  while (block && !block.querySelector('ul, ol')) {
    block = block.parentElement;
  }

  expect(block, `в блоке «${title}» есть список`).not.toBeNull();

  return block as HTMLElement;
};

/** Карточки статей — пункты первого списка блока «Статьи». */
const cardsOf = (block: HTMLElement) => [...(block.querySelector('ul, ol')?.querySelectorAll(':scope > li') ?? [])];

const articleLinks = (card: Element) =>
  [...card.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href')).filter((href) => href !== null);

/** Плита-заглушка вместо кадра: скрытый элемент без текста и без картинки внутри (иконка-стрелка — не заглушка). */
const emptyPlates = (card: Element) =>
  [...card.querySelectorAll('[aria-hidden="true"]')].filter(
    (element) =>
      element.tagName.toLowerCase() !== 'svg' &&
      plain(element.textContent) === '' &&
      !element.querySelector('img, picture, svg'),
  );

let lexical: LexicalModule['lexicalFromSections'];

const article = (slug: string, publishedAt: string, photo: string | null = `article-${slug}`, id = 1): Article => ({
  id,
  slug,
  title: `Заголовок статьи ${slug}`,
  lead: `Лид статьи ${slug}: о чем она и кому пригодится.`,
  publishedAt,
  photo,
  content: lexical([{ title: `Раздел ${slug}`, paragraphs: [`Абзац статьи ${slug}.`] }]),
  updatedAt: publishedAt,
  createdAt: publishedAt,
});

/** Пять статей вперемешку по дате: ни порядок массива, ни обратный порядок не совпадают с порядком дат. */
const fiveArticles = () => [
  article('self-criticism', '2026-09-08T09:00:00.000Z', undefined, 1),
  article('burnout-signs', '2026-10-28T09:00:00.000Z', undefined, 2),
  article('first-session', '2026-09-30T09:00:00.000Z', undefined, 3),
  article('couple-conflicts', '2026-10-20T09:00:00.000Z', undefined, 4),
  article('night-anxiety', '2026-10-10T09:00:00.000Z', undefined, 5),
];

/** Три последние из `fiveArticles`, от новой к старой. */
const LATEST_THREE = ['burnout-signs', 'couple-conflicts', 'night-anxiety'];

const slugsOf = (articles: { slug: string }[]) => articles.map(({ slug }) => slug);

beforeEach(async () => {
  ({ lexicalFromSections: lexical } = await importExpert<LexicalModule>('cms/seed/lexical.ts'));
  cms.articles = [];
  cms.reviews = [];
});

describe('latestArticles — статьи для блока на главной', () => {
  it('H1: latestArticles: три последние по дате, по убыванию', async () => {
    const { latestArticles } = await importExpert<ArticleModule>('lib/article.ts');
    const input = fiveArticles();
    const before = [...input];

    expect(latestArticles, 'latestArticles в lib/article.ts').toBeTypeOf('function');
    expect(slugsOf(latestArticles(input, 3))).toEqual(LATEST_THREE);
    expect(input, 'входной массив не изменен').toEqual(before);
    expect(slugsOf(input)).toEqual(slugsOf(before));
  });

  it('H2: latestArticles: статей меньше трех', async () => {
    const { latestArticles } = await importExpert<ArticleModule>('lib/article.ts');
    const two = [
      article('night-anxiety', '2026-10-10T09:00:00.000Z'),
      article('burnout-signs', '2026-10-28T09:00:00.000Z'),
    ];

    expect(latestArticles, 'latestArticles в lib/article.ts').toBeTypeOf('function');
    expect(slugsOf(latestArticles(two, 3))).toEqual(['burnout-signs', 'night-anxiety']);
    expect(latestArticles([], 3)).toEqual([]);
  });

  it('C1: coverSizes: sizes обложки по месту карточки', async () => {
    const { coverSizes } = await importExpert<CoverModule>('lib/article.ts');
    const { ARTICLE_COVER_SIZES: SIZES } = await importExpert<ConstsModule>('consts.ts');
    const places: [index: number, total: number, kind: CoverKind][] = [
      [0, 1, 'single'],
      [0, 2, 'lead'],
      [0, 3, 'lead'],
      [1, 3, 'side'],
      [2, 3, 'side'],
      [3, 6, 'row'],
      [5, 6, 'row'],
    ];

    expect(new Set(Object.values(SIZES)).size, 'у каждого места свои sizes').toBe(4);
    expect(places.map(([index, total]) => coverSizes(index, total))).toEqual(places.map(([, , kind]) => SIZES[kind]));
  });
});

describe('главная «Эксперта» — блок «Статьи»', () => {
  it('H3: главная: блок «Статьи» — три последние карточки с обложкой, заголовком, лидом и ссылкой', async () => {
    const articles = fiveArticles();

    cms.articles = articles;

    const body = await renderHome();
    const block = blockOf(body, ARTICLES_TITLE);
    const cards = cardsOf(block);

    expect(cards, 'ровно три карточки').toHaveLength(3);
    expect(
      cards.map((card) => articleLinks(card).find((href) => href.startsWith('/articles/'))),
      'карточки — три последние статьи, от новой к старой',
    ).toEqual(LATEST_THREE.map((slug) => `/articles/${slug}`));

    cards.forEach((card, index) => {
      const slug = LATEST_THREE[index] ?? '';
      const source = articles.find((item) => item.slug === slug);
      const text = plain(card.textContent);

      expect(card.querySelector('picture img'), `${slug}: обложка — picture с img`).not.toBeNull();
      expect(text, `${slug}: заголовок`).toContain(plain(source?.title));
      expect(text, `${slug}: лид`).toContain(plain(source?.lead));
      expect(card.querySelector(`a[href="/articles/${slug}"]`), `${slug}: ссылка на статью`).not.toBeNull();
    });

    const all = [...block.querySelectorAll('a')].filter((anchor) => plain(anchor.textContent) === ALL_ARTICLES);

    expect(
      all.map((anchor) => anchor.getAttribute('href')),
      'ссылка «Все статьи» на /articles',
    ).toEqual(['/articles']);
  });

  it('H4: главная: статей две — две карточки, пустых нет', async () => {
    cms.articles = [
      article('night-anxiety', '2026-10-10T09:00:00.000Z', undefined, 1),
      article('burnout-signs', '2026-10-28T09:00:00.000Z', undefined, 2),
    ];

    const cards = cardsOf(blockOf(await renderHome(), ARTICLES_TITLE));

    expect(cards, 'ровно две карточки').toHaveLength(2);

    cards.forEach((card, index) => {
      const slug = ['burnout-signs', 'night-anxiety'][index];

      expect(plain(card.textContent), `карточка ${index + 1}: заголовок`).toContain(`Заголовок статьи ${slug}`);
      expect(card.querySelector(`a[href="/articles/${slug}"]`), `карточка ${index + 1}: ссылка`).not.toBeNull();
    });
  });

  it('H5: главная: статей нет — блока нет', async () => {
    cms.articles = [];

    const body = await renderHome();
    const all = [...body.querySelectorAll('a')].filter((anchor) => plain(anchor.textContent) === ALL_ARTICLES);

    expect(headingsWith(body, ARTICLES_TITLE), 'заголовка «Статьи» нет').toEqual([]);
    expect(all, 'ссылки «Все статьи» нет').toEqual([]);
  });

  it('H6: карточка статьи без photo — без обложки и без пустой плиты', async () => {
    const articles = [
      article('burnout-signs', '2026-10-28T09:00:00.000Z', undefined, 1),
      article('couple-conflicts', '2026-10-20T09:00:00.000Z', null, 2),
      article('night-anxiety', '2026-10-10T09:00:00.000Z', undefined, 3),
    ];

    cms.articles = articles;

    const cards = cardsOf(blockOf(await renderHome(), ARTICLES_TITLE));
    const bare = cards.find((card) => card.querySelector('a[href="/articles/couple-conflicts"]'));

    expect(cards, 'три карточки').toHaveLength(3);
    expect(bare, 'карточка статьи без photo').toBeDefined();
    expect(bare?.querySelector('picture'), 'без обложки').toBeNull();
    expect(bare?.querySelector('img'), 'без картинки').toBeNull();
    expect(emptyPlates(bare as Element), 'без пустой плиты').toEqual([]);
    expect(plain(bare?.textContent), 'заголовок').toContain(plain(articles[1]?.title));
    expect(plain(bare?.textContent), 'лид').toContain(plain(articles[1]?.lead));
  });
});

describe('портрет и /articles — кадры вместо плит', () => {
  it('P1: портрет: кадр вместо «ВЛ»', async () => {
    const { Portrait } = await importExpert<PortraitModule>('components/Portrait/index.ts');
    const body = await renderBody(<Portrait />);
    const image = body.querySelector('picture img');

    expect(image, 'picture с img').not.toBeNull();
    expect(image?.getAttribute('loading'), 'кадр первого экрана не ленивый').not.toBe('lazy');
    expect(image?.getAttribute('fetchpriority'), 'кадр первого экрана — высокий приоритет').toBe('high');
    expect(plain(body.textContent)).not.toContain('ВЛ');
    expect(plain(body.querySelector('figcaption')?.textContent)).toBe('Вера Ланская, психолог');
  });

  it('P2: /articles: у статьи с photo — кадр, без photo — ни кадра, ни пустой плиты', async () => {
    const { ArticleList } = await importExpert<ArticleListModule>('components/ArticleList/index.ts');
    const body = await renderBody(
      <ArticleList
        articles={[
          article('burnout-signs', '2026-10-28T09:00:00.000Z', undefined, 1),
          article('couple-conflicts', '2026-10-20T09:00:00.000Z', '', 2),
        ]}
      />,
    );
    const cardOf = (slug: string) =>
      [...body.querySelectorAll('li')].find((item) => item.querySelector(`a[href="/articles/${slug}"]`));
    const withPhoto = cardOf('burnout-signs');
    const withoutPhoto = cardOf('couple-conflicts');

    expect(withPhoto, 'карточка статьи с photo').toBeDefined();
    expect(withoutPhoto, 'карточка статьи без photo').toBeDefined();
    expect(withPhoto?.querySelector('picture img'), 'у статьи с photo — кадр').not.toBeNull();
    expect(withoutPhoto?.querySelector('picture'), 'у статьи без photo — без кадра').toBeNull();
    expect(emptyPlates(withoutPhoto as Element), 'у статьи без photo — без пустой плиты').toEqual([]);
  });
});

describe('отзывы «Эксперта»', () => {
  it('R1: засев: три и больше отзывов, подпись — имя и буква фамилии', async () => {
    const { REVIEWS } = await importExpert<SeedModule>('cms/seed/data.ts');

    expect(Array.isArray(REVIEWS), 'REVIEWS в засеве «Эксперта»').toBe(true);
    expect(REVIEWS?.length).toBeGreaterThanOrEqual(3);

    for (const { author, text } of REVIEWS ?? []) {
      expect(isReviewAuthor(author), `подпись «${author}» — имя и первая буква фамилии`).toBe(true);
      expect(text.trim(), `текст отзыва ${author}`).not.toBe('');
    }
  });

  it('R2: главная: блок «Отзывы» — тексты и подписи, без картинок', async () => {
    const { REVIEWS } = await importExpert<SeedModule>('cms/seed/data.ts');

    expect((REVIEWS ?? []).length, 'REVIEWS в засеве «Эксперта»').toBeGreaterThan(0);

    const reviews = REVIEWS ?? [];

    cms.reviews = reviews;
    cms.articles = fiveArticles();

    const block = blockOf(await renderHome(), REVIEWS_TITLE);

    expect([...block.querySelectorAll('blockquote')].map((quote) => plain(quote.textContent))).toEqual(
      reviews.map(({ text }) => plain(text)),
    );
    expect([...block.querySelectorAll('cite')].map((cite) => plain(cite.textContent))).toEqual(
      reviews.map(({ author }) => plain(author)),
    );
    expect(block.querySelectorAll('img, picture, svg'), 'в блоке отзывов нет картинок').toHaveLength(0);
  });
});
