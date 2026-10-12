/** @vitest-environment happy-dom */
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

type MenuItem = {
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
};

type MenuFilter = { category?: string; tags: string[] };

type MenuOption = { slug: string; name: string };

type SearchParams = Record<string, string | string[] | undefined>;

type MenuScreenProps = {
  items: MenuItem[];
  categories: MenuOption[];
  tags: MenuOption[];
  searchParams: SearchParams;
};

type PosterProps = { url: string; qrSvg: string };

const COFFEE_SRC = path.resolve(import.meta.dirname, '../../apps/coffee/src');

/** Модуль демо «Кофейня»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importCoffee = async <T,>(relative: string): Promise<T> => {
  const file = path.join(COFFEE_SRC, relative);

  expect(existsSync(file), `нет apps/coffee/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const QR_URL = 'https://coffee.mrshkn.com/menu?qr=1';

const CATEGORIES: MenuOption[] = [
  { slug: 'coffee', name: 'Кофе' },
  { slug: 'tea', name: 'Чай' },
  { slug: 'bakery', name: 'Выпечка' },
];

const TAGS: MenuOption[] = [
  { slug: 'oat', name: 'На растительном молоке' },
  { slug: 'no-sugar', name: 'Без сахара' },
  { slug: 'vegan', name: 'Веганское' },
];

/** Своя фикстура, не засев: у «Рафа» два признака, у «Эспрессо» ни одного. Цены < 1000 — без разделителя тысяч. */
const ITEMS: MenuItem[] = [
  { slug: 'espresso', name: 'Эспрессо', price: 150, category: 'coffee', tags: [] },
  { slug: 'oat-flat-white', name: 'Флэт уайт на овсяном', price: 350, category: 'coffee', tags: ['oat'] },
  { slug: 'oat-raf', name: 'Раф без сахара на овсяном', price: 390, category: 'coffee', tags: ['oat', 'no-sugar'] },
  { slug: 'oat-matcha', name: 'Матча на овсяном', price: 320, category: 'tea', tags: ['oat'] },
  { slug: 'sencha', name: 'Сенча', price: 220, category: 'tea', tags: ['no-sugar'] },
  { slug: 'date-cookie', name: 'Печенье с финиками', price: 180, category: 'bakery', tags: ['vegan'] },
];

/** Порядок фикстуры литералом: реализация, сортирующая массив на месте, испортит и `ITEMS`. */
const ORDER = ['espresso', 'oat-flat-white', 'oat-raf', 'oat-matcha', 'sencha', 'date-cookie'];

const slugsOf = (items: MenuItem[]) => items.map(({ slug }) => slug);

const itemsBySlug = (slugs: string[]) => ITEMS.filter(({ slug }) => slugs.includes(slug));

/** Текст разметки с обычными пробелами вместо неразрывных: типограф ставит их по-своему. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/[  ]/g, ' ');

const sorted = (values: string[]) => [...values].sort();

type MenuModule = {
  filterMenu: (items: MenuItem[], filter: MenuFilter) => MenuItem[];
  parseMenuFilter: (searchParams: SearchParams) => MenuFilter & { qr: boolean };
};

type SeedModule = { MENU_CATEGORIES: MenuOption[]; MENU_TAGS: MenuOption[]; MENU_ITEMS: MenuItem[] };

const loadMenu = () => importCoffee<MenuModule>('lib/menu.ts');

const loadSeed = () => importCoffee<SeedModule>('cms/seed/data.ts');

const loadMenuScreen = async () =>
  (await importCoffee<{ MenuScreen: ComponentType<MenuScreenProps> }>('components/MenuScreen/index.ts')).MenuScreen;

describe('фильтр меню — filterMenu', () => {
  it('F1: пустой фильтр — все позиции в исходном порядке', async () => {
    const { filterMenu } = await loadMenu();

    expect(slugsOf(filterMenu(ITEMS, { tags: [] }))).toEqual(ORDER);
  });

  it('F2: категория — только ее позиции в исходном порядке', async () => {
    const { filterMenu } = await loadMenu();

    expect(slugsOf(filterMenu(ITEMS, { category: 'tea', tags: [] }))).toEqual(['oat-matcha', 'sencha']);
  });

  it('F3: признак — позиции с ним из всех категорий', async () => {
    const { filterMenu } = await loadMenu();

    expect(slugsOf(filterMenu(ITEMS, { tags: ['oat'] }))).toEqual(['oat-flat-white', 'oat-raf', 'oat-matcha']);
  });

  it('F4: несколько признаков — И: только позиции с каждым из них', async () => {
    const { filterMenu } = await loadMenu();

    expect(slugsOf(filterMenu(ITEMS, { tags: ['oat', 'no-sugar'] }))).toEqual(['oat-raf']);
  });

  it('F5: категория и признак — пересечение', async () => {
    const { filterMenu } = await loadMenu();

    expect(slugsOf(filterMenu(ITEMS, { category: 'coffee', tags: ['oat'] }))).toEqual(['oat-flat-white', 'oat-raf']);
  });

  it('F6: без совпадений — пустой массив', async () => {
    const { filterMenu } = await loadMenu();

    expect(filterMenu(ITEMS, { category: 'bakery', tags: ['oat'] })).toEqual([]);
  });

  it('F7: исходный массив не меняется', async () => {
    const { filterMenu } = await loadMenu();

    const items = [...ITEMS];

    filterMenu(items, { category: 'coffee', tags: ['oat', 'no-sugar'] });
    filterMenu(items, { tags: ['vegan'] });

    expect(items).toHaveLength(6);
    expect(slugsOf(items)).toEqual(ORDER);
  });
});

describe('разбор адреса — parseMenuFilter', () => {
  const seedSlugs = async () => {
    const { MENU_CATEGORIES, MENU_TAGS } = await loadSeed();

    return { seedCategories: MENU_CATEGORIES.map(({ slug }) => slug), seedTags: MENU_TAGS.map(({ slug }) => slug) };
  };

  it('P1: без параметров — весь каталог, полный вид', async () => {
    const { parseMenuFilter } = await loadMenu();

    expect(parseMenuFilter({})).toEqual({ category: undefined, tags: [], qr: false });
  });

  it('P2: категория и признаки — строкой и массивом', async () => {
    const { parseMenuFilter } = await loadMenu();
    const { seedCategories, seedTags } = await seedSlugs();

    expect(seedCategories, 'засев: категория tea').toContain('tea');
    expect(seedTags, 'засев: признаки oat и vegan').toEqual(expect.arrayContaining(['oat', 'vegan']));

    expect(parseMenuFilter({ category: 'tea', tag: 'oat' })).toEqual({ category: 'tea', tags: ['oat'], qr: false });
    expect(parseMenuFilter({ tag: ['oat', 'vegan'] }).tags).toEqual(['oat', 'vegan']);
  });

  it('P3: компактный вид — только по точному qr=1', async () => {
    const { parseMenuFilter } = await loadMenu();

    expect(parseMenuFilter({ qr: '1' }).qr).toBe(true);
    expect(parseMenuFilter({ qr: '0' }).qr).toBe(false);
    expect(parseMenuFilter({ qr: '' }).qr).toBe(false);
    expect(parseMenuFilter({ qr: 'yes' }).qr).toBe(false);
  });

  it('P4: неизвестные категория и признак отброшены', async () => {
    const { parseMenuFilter } = await loadMenu();
    const { seedCategories, seedTags } = await seedSlugs();

    expect(seedCategories).not.toContain('pizza');
    expect(seedTags).not.toContain('<script>');

    expect(parseMenuFilter({ category: 'pizza', tag: '<script>' })).toEqual({
      category: undefined,
      tags: [],
      qr: false,
    });
    expect(parseMenuFilter({ category: 'pizza', tag: ['oat', '<script>'] })).toEqual({
      category: undefined,
      tags: ['oat'],
      qr: false,
    });
  });

  it('P5: повторенный признак — один раз', async () => {
    const { parseMenuFilter } = await loadMenu();

    expect(parseMenuFilter({ tag: ['oat', 'oat'] }).tags).toEqual(['oat']);
  });
});

describe('засев меню — MENU_ITEMS', () => {
  it('S1: каждый чип меняет список; категории и признаки — из засева; slug уникальны; цены — целые > 0', async () => {
    const { MENU_CATEGORIES, MENU_TAGS, MENU_ITEMS } = await loadSeed();
    const categorySlugs = MENU_CATEGORIES.map(({ slug }) => slug);
    const tagSlugs = MENU_TAGS.map(({ slug }) => slug);

    expect(MENU_CATEGORIES.length).toBeGreaterThan(0);
    expect(MENU_TAGS.length).toBeGreaterThan(0);

    for (const category of categorySlugs) {
      expect(
        MENU_ITEMS.filter((item) => item.category === category).length,
        `позиции категории ${category}`,
      ).toBeGreaterThanOrEqual(1);
    }

    for (const tag of tagSlugs) {
      const count = MENU_ITEMS.filter((item) => item.tags.includes(tag)).length;

      expect(count, `позиции с признаком ${tag}`).toBeGreaterThanOrEqual(1);
      expect(count, `признак ${tag} не у всех позиций`).toBeLessThan(MENU_ITEMS.length);
    }

    for (const item of MENU_ITEMS) {
      expect(categorySlugs, `категория позиции ${item.slug}`).toContain(item.category);

      for (const tag of item.tags) {
        expect(tagSlugs, `признак позиции ${item.slug}`).toContain(tag);
      }

      expect(Number.isInteger(item.price), `цена ${item.slug} — целые рубли`).toBe(true);
      expect(item.price, `цена ${item.slug}`).toBeGreaterThan(0);
    }

    expect(new Set(slugsOf(MENU_ITEMS)).size).toBe(MENU_ITEMS.length);
  });
});

describe('экран меню — MenuScreen', () => {
  const render = async (searchParams: SearchParams) => {
    const MenuScreen = await loadMenuScreen();
    const markup = renderToStaticMarkup(
      <MenuScreen
        items={ITEMS}
        categories={CATEGORIES}
        tags={TAGS}
        searchParams={searchParams}
      />,
    );
    const body = new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;

    return { markup, body, text: plain(body.textContent) };
  };

  /** Ссылки на страницу меню: чипы фильтра, сброс; адрес разобран. */
  const menuLinks = (body: HTMLElement) =>
    [...body.querySelectorAll('a')]
      .map((anchor) => ({ anchor, url: new URL(anchor.getAttribute('href') ?? '', 'https://coffee.mrshkn.com') }))
      .filter(({ url }) => url.pathname === '/menu');

  /** Чип — ссылка на меню с названием категории или признака. */
  const chip = (body: HTMLElement, name: string) => {
    const found = menuLinks(body).filter(({ anchor }) => plain(anchor.textContent).includes(name));

    expect(found, `чип «${name}»`).toHaveLength(1);

    return found[0];
  };

  const isMarked = (anchor: Element) =>
    anchor.getAttribute('aria-current') === 'true' || anchor.getAttribute('aria-pressed') === 'true';

  const expectChips = (body: HTMLElement) => {
    const links = menuLinks(body);

    for (const { slug, name } of CATEGORIES) {
      expect(
        links.some(
          ({ anchor, url }) => url.searchParams.get('category') === slug && plain(anchor.textContent).includes(name),
        ),
        `ссылка категории ${slug}`,
      ).toBe(true);
    }

    for (const { slug, name } of TAGS) {
      expect(
        links.some(
          ({ anchor, url }) =>
            url.searchParams.getAll('tag').includes(slug) && plain(anchor.textContent).includes(name),
        ),
        `ссылка признака ${slug}`,
      ).toBe(true);
    }
  };

  const expectAllItems = (text: string) => {
    for (const item of ITEMS) {
      expect(text, item.slug).toContain(plain(item.name));
    }
  };

  const expectAllPrices = (body: HTMLElement) => {
    for (const item of ITEMS) {
      expect(body.textContent, `цена ${item.slug}`).toContain(`${item.price} ₽`);
    }
  };

  it('R1: полный вид — шапка с меню сайта, «Лояльность» на /loyalty, фильтр, все позиции с ценами', async () => {
    const { body, text } = await render({});
    const loyalty = [...body.querySelectorAll('a')].filter((anchor) =>
      plain(anchor.textContent).includes('Лояльность'),
    );

    expect(body.querySelector('header')).not.toBeNull();
    expect(body.querySelectorAll('header nav a[href]').length).toBeGreaterThan(0);
    expect(loyalty.length, 'кнопка «Лояльность»').toBeGreaterThan(0);

    for (const anchor of loyalty) {
      expect(anchor.getAttribute('href')).toBe('/loyalty');
    }

    expectChips(body);
    expectAllItems(text);
    expectAllPrices(body);
    expect(body.textContent).toContain('350 ₽');
  });

  it('R2: qr=1 — компактный вид без шапки, меню сайта и «Лояльности»; чипы и все позиции с ценами', async () => {
    const { markup, body, text } = await render({ qr: '1' });

    expect(markup).not.toContain('<header');
    expect(markup).not.toContain('<nav');
    expect(body.querySelector('a[href^="/loyalty"]')).toBeNull();
    expect(text).not.toContain('Лояльность');

    expectChips(body);
    expectAllItems(text);
    expectAllPrices(body);
  });

  it('R3: категория tea — только позиции чая, ее ссылка отмечена', async () => {
    const { body, text } = await render({ category: 'tea' });

    for (const item of itemsBySlug(['oat-matcha', 'sencha'])) {
      expect(text, item.slug).toContain(plain(item.name));
    }

    for (const item of itemsBySlug(['espresso', 'oat-flat-white', 'oat-raf', 'date-cookie'])) {
      expect(text, item.slug).not.toContain(plain(item.name));
    }

    expect(isMarked(chip(body, 'Чай').anchor), 'чип «Чай» отмечен').toBe(true);
    expect(isMarked(chip(body, 'Кофе').anchor), 'чип «Кофе» не отмечен').toBe(false);
  });

  it('R4: без совпадений — пустое состояние и сброс на /menu, в компактном виде — на /menu?qr=1', async () => {
    const full = await render({ category: 'bakery', tag: 'oat' });
    const fullReset = [...full.body.querySelectorAll('a[href="/menu"]')].filter((anchor) => !anchor.closest('header'));

    for (const item of ITEMS) {
      expect(full.text, item.slug).not.toContain(plain(item.name));
    }

    expect(fullReset.length, 'сброс на /menu').toBeGreaterThan(0);
    expect(plain(fullReset[0].textContent).trim()).not.toBe('');

    const compact = await render({ category: 'bakery', tag: 'oat', qr: '1' });
    const compactReset = compact.body.querySelectorAll('a[href="/menu?qr=1"]');

    for (const item of ITEMS) {
      expect(compact.text, item.slug).not.toContain(plain(item.name));
    }

    expect(compactReset.length, 'сброс на /menu?qr=1').toBeGreaterThan(0);
    expect(plain(compactReset[0].textContent).trim()).not.toBe('');
    expect(compact.body.querySelector('a[href="/menu"]'), 'сброс не теряет qr=1').toBeNull();
  });

  it('R5: qr=1 с фильтром — каждая ссылка чипа сохраняет qr=1; выбранный признак снимается, остальное сохраняется', async () => {
    const { body } = await render({ qr: '1', category: 'coffee', tag: ['oat', 'no-sugar'] });
    const links = menuLinks(body);

    expect(links.length).toBeGreaterThanOrEqual(CATEGORIES.length + TAGS.length);

    for (const { url } of links) {
      expect(url.searchParams.get('qr'), url.toString()).toBe('1');
    }

    const oat = chip(body, 'На растительном молоке').url.searchParams;
    const noSugar = chip(body, 'Без сахара').url.searchParams;
    const vegan = chip(body, 'Веганское').url.searchParams;

    expect(oat.get('category')).toBe('coffee');
    expect(oat.getAll('tag')).toEqual(['no-sugar']);
    expect(noSugar.get('category')).toBe('coffee');
    expect(noSugar.getAll('tag')).toEqual(['oat']);
    expect(vegan.get('category')).toBe('coffee');
    expect(sorted(vegan.getAll('tag'))).toEqual(sorted(['oat', 'no-sugar', 'vegan']));
  });
});

describe('плакат с QR — menuQrUrl, Poster', () => {
  it('Q1: QR-код плаката ведет на компактное меню демо', async () => {
    const { menuQrUrl } = await importCoffee<{ menuQrUrl: () => string }>('lib/qr.ts');

    expect(menuQrUrl()).toBe(QR_URL);
  });

  it('Q2: плакат — переданный SVG кода, под ним читаемый адрес, без шапки', async () => {
    const { Poster } = await importCoffee<{ Poster: ComponentType<PosterProps> }>('components/Poster/index.ts');
    const svg = '<svg data-qr="1"></svg>';
    const markup = renderToStaticMarkup(
      <Poster
        url={QR_URL}
        qrSvg={svg}
      />,
    );
    const svgIndex = markup.indexOf(svg);
    const afterSvg = new DOMParser().parseFromString(`<body>${markup.slice(svgIndex)}</body>`, 'text/html').body;

    expect(svgIndex, 'SVG кода в разметке').toBeGreaterThanOrEqual(0);
    expect(plain(afterSvg.textContent)).toContain('coffee.mrshkn.com/menu?qr=1');
    expect(markup).not.toContain('<header');
  });
});
