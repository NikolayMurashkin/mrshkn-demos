/** @vitest-environment happy-dom */
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Lang = 'ru' | 'en';

type PageProps = { params: Promise<{ lang: string }> };

type PageModule = {
  default: (props: PageProps) => ReactNode | Promise<ReactNode>;
  dynamic?: unknown;
};

type ImageData = { src: string; width: number; height: number };

/** Тот же объект, что дает статический импорт картинки в Next: импорт `.jpg` в unit не грузится. */
const image = vi.hoisted(() => (key: string): ImageData => ({
  src: `/_next/static/media/${key}.0a1b2c3d.jpg`,
  width: 2400,
  height: 1600,
}));

/** Карта кадров — от теста: ключи из `keys.ts` демо, любой другой ключ тоже получает кадр. */
vi.mock('../../apps/event/src/assets/photos/index.ts', async () => {
  const { existsSync: exists } = await import('node:fs');
  const keysFile = (await import('node:path')).resolve(
    import.meta.dirname,
    '../../apps/event/src/assets/photos/keys.ts',
  );
  const keys: readonly string[] = exists(keysFile)
    ? ((await import(/* @vite-ignore */ keysFile)) as { PHOTO_KEYS: readonly string[] }).PHOTO_KEYS
    : [];
  const photos = Object.fromEntries(keys.map((key) => [key, image(key)]));

  return {
    PHOTOS: new Proxy(photos, {
      get: (target, key) => (typeof key === 'string' ? (target[key] ?? image(key)) : undefined),
    }),
  };
});

const EVENT_SRC = path.resolve(import.meta.dirname, '../../apps/event/src');

/** Модуль демо «Концерт»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importEvent = async <T,>(relative: string): Promise<T> => {
  const file = path.join(EVENT_SRC, relative);

  expect(existsSync(file), `нет apps/event/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const loadPage = () => importEvent<PageModule>('app/(site)/[lang]/page.tsx');

const AFISHA_URL = 'https://afisha.yandex.ru/kaliningrad';

const BUY_LABEL: Record<Lang, string> = { ru: 'Купить билет', en: 'Buy tickets' };

/** 2026-11-02 12:00 по Калининграду (UTC+2), понедельник. */
const MONDAY_NOON = new Date('2026-11-02T10:00:00Z');

/** 2026-11-08 12:00 по Калининграду, воскресенье. */
const SUNDAY_NOON = new Date('2026-11-08T10:00:00Z');

/** Текст с обычными пробелами вместо неразрывных, пробелы схлопнуты. */
const plain = (text: string | null | undefined) =>
  (text ?? '')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Разметка целиком, с асинхронными компонентами внутри. */
const renderPage = async (lang: string, page?: PageModule) => {
  const { default: Page } = page ?? (await loadPage());
  const { prelude } = await prerender(<>{await Page({ params: Promise.resolve({ lang }) })}</>);
  const markup = await new Response(prelude).text();
  const body = new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;
  const hero = body.querySelector('main section');
  const tickets = body.querySelector('section#tickets');

  expect(hero, 'первый экран — первый <section> внутри <main>').not.toBeNull();

  return { body, hero: hero as Element, tickets };
};

const anchorsWith = (root: Element | null, label: string) =>
  [...(root?.querySelectorAll('a') ?? [])].filter((anchor) => plain(anchor.textContent).includes(label));

const relOf = (anchor: Element) => (anchor.getAttribute('rel') ?? '').split(/\s+/);

const expectAfishaLink = (anchor: Element, label: string) => {
  expect(anchor.getAttribute('href'), label).toBe(AFISHA_URL);
  expect(anchor.getAttribute('target'), label).toBe('_blank');
  expect(relOf(anchor), label).toContain('noopener');
};

/** Все `@type` в JSON-LD: вложенные объекты, массивы, `@graph`, `@type` строкой и массивом. */
const typesOf = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(typesOf);
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([key, item]) =>
    key === '@type' ? [item].flat().filter((type): type is string => typeof type === 'string') : typesOf(item),
  );
};

/** Все объекты JSON-LD рекурсивно, как у `typesOf`: вложенные объекты, массивы, `@graph`. */
const nodesOf = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.flatMap(nodesOf);
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return [value as Record<string, unknown>, ...Object.values(value).flatMap(nodesOf)];
};

/** `@type` одного объекта JSON-LD: строкой или массивом. */
const ownTypes = (node: Record<string, unknown>) =>
  [node['@type']].flat().filter((type): type is string => typeof type === 'string');

/** Карточка билета — самый широкий предок ссылки «Купить билет», в котором нет других таких ссылок. */
const cardOf = (anchor: Element, tickets: Element, label: string) => {
  let card = anchor;

  while (card.parentElement && card.parentElement !== tickets && anchorsWith(card.parentElement, label).length === 1) {
    card = card.parentElement;
  }

  return card;
};

/** Пояс машины — не Калининград: расчет по поясу машины, а не по Калининграду, падает и там, где машина в Калининграде. */
const MACHINE_TIME_ZONE = 'UTC';

const previousTimeZone = process.env.TZ;

beforeAll(() => {
  process.env.TZ = MACHINE_TIME_ZONE;
});

afterAll(() => {
  if (previousTimeZone === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = previousTimeZone;
  }
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(MONDAY_NOON);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('страница концерта — кнопки «Купить билет» ведут на Афишу', () => {
  it.each(['ru', 'en'] as const)(
    'G1: %s — не меньше 4 кнопок «Купить билет»: одна в первом экране, три в #tickets; Афиша, новая вкладка, noopener',
    async (lang) => {
      const { body, hero, tickets } = await renderPage(lang);
      const label = BUY_LABEL[lang];
      const all = anchorsWith(body, label);

      expect(all.length).toBeGreaterThanOrEqual(4);
      expect(anchorsWith(hero, label), 'в первом экране').toHaveLength(1);
      expect(tickets, 'секция <section id="tickets">').not.toBeNull();
      expect(anchorsWith(tickets, label), 'в #tickets').toHaveLength(3);

      for (const anchor of all) {
        expectAfishaLink(anchor, label);
      }
    },
  );

  it.each(['ru', 'en'] as const)(
    'G2: %s — любая ссылка на afisha.yandex.ru открывается в новой вкладке с noopener',
    async (lang) => {
      const { body } = await renderPage(lang);
      const afisha = [...body.querySelectorAll('a')].filter((anchor) =>
        (anchor.getAttribute('href') ?? '').startsWith('https://afisha.yandex.ru'),
      );

      expect(afisha.length, 'ссылки на Афишу есть').toBeGreaterThan(0);

      for (const anchor of afisha) {
        const href = anchor.getAttribute('href');

        expect(anchor.getAttribute('target'), `${href}`).toBe('_blank');
        expect(relOf(anchor), `${href}`).toContain('noopener');
      }
    },
  );
});

const CARDS: Record<Lang, [name: string, price: string][]> = {
  ru: [
    ['Балкон', '1\u00a0500\u00a0₽'],
    ['Партер', '2\u00a0500\u00a0₽'],
    ['Первые ряды', '3\u00a0500\u00a0₽'],
  ],
  en: [
    ['Balcony', '₽1,500'],
    ['Stalls', '₽2,500'],
    ['Front rows', '₽3,500'],
  ],
};

describe('страница концерта — три категории билетов', () => {
  it.each([
    ['T1', 'ru'],
    ['T2', 'en'],
  ] as const)(
    '%s: %s — в #tickets три карточки по порядку цены, у каждой название и цена по формату языка',
    async (_id, lang) => {
      const { tickets } = await renderPage(lang);
      const label = BUY_LABEL[lang];

      expect(tickets, 'секция <section id="tickets">').not.toBeNull();

      const cards = anchorsWith(tickets, label).map((anchor) => cardOf(anchor, tickets as Element, label));

      expect(cards).toHaveLength(3);

      CARDS[lang].forEach(([name, price], index) => {
        const text = cards[index]?.textContent ?? '';

        expect(plain(text), `${index + 1}-я карточка: название`).toContain(name);
        expect(text, `${index + 1}-я карточка: цена`).toContain(price);
      });
    },
  );
});

describe('страница концерта — JSON-LD и плашка «Мероприятие вымышленное»', () => {
  it.each(['ru', 'en'] as const)('J1: %s — в JSON-LD нет Event, MusicEvent и других …Event', async (lang) => {
    const { body } = await renderPage(lang);
    const types = [...body.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) =>
      typesOf(JSON.parse(script.textContent ?? 'null')),
    );

    for (const type of types) {
      expect(type).not.toBe('Event');
      expect(type).not.toBe('MusicEvent');
      expect(type.endsWith('Event'), `@type ${type}`).toBe(false);
    }
  });

  it.each([
    { lang: 'ru' as const, plate: 'Мероприятие вымышленное — это пример сайта' },
    { lang: 'en' as const, plate: 'This event is fictional — this is a sample website' },
  ])('J2: $lang — плашка «Мероприятие вымышленное» в первом экране', async ({ lang, plate }) => {
    const { hero } = await renderPage(lang);

    expect(plain(hero.textContent)).toContain(plain(plate));
  });

  it.each([
    {
      lang: 'ru' as const,
      note: 'Билет на этот концерт не продается: кнопки ведут на все события Калининграда на Яндекс Афише',
      priceLine: 'от 1 500 ₽ · билеты на Яндекс Афише',
      price: '1\u00a0500\u00a0₽',
      afisha: 'Яндекс Афише',
    },
    {
      lang: 'en' as const,
      note: 'Tickets for this concert are not on sale: the buttons lead to all Kaliningrad events on Yandex Afisha',
      priceLine: 'from ₽1,500 · tickets on Yandex Afisha',
      price: '₽1,500',
      afisha: 'Yandex Afisha',
    },
  ])(
    'J3: $lang — в первом экране пояснение к плашке и строка цены самой дешевой категории со ссылкой на Афишу',
    async ({ lang, note, priceLine, price, afisha }) => {
      const { hero } = await renderPage(lang);
      const text = plain(hero.textContent);

      expect(text).toContain(plain(note));
      expect(text).toContain(priceLine);
      expect(text).toContain(afisha);
      expect(hero.textContent ?? '', 'цена по формату языка').toContain(price);
    },
  );
});

describe('страница концерта — дата считается при отрисовке', () => {
  it('H1: ru и en, сегодня 02.11.2026 по Калининграду — в первом экране суббота 28 ноября, 19:00, Калининград', async () => {
    const ru = (await renderPage('ru')).hero.textContent ?? '';

    expect(ru).toContain('суббота, 28\u00a0ноября');
    expect(ru).toContain('начало в\u00a019:00');
    expect(ru).toContain('Калининград');

    const en = plain((await renderPage('en')).hero.textContent);

    expect(en).toContain('Saturday, November 28');
    expect(en).toContain('starts at 7 pm');
    expect(en).toContain('Kaliningrad');
  });

  it('H2: та же страница второй раз, сегодня 08.11.2026 — в первом экране суббота 5 декабря', async () => {
    const page = await loadPage();

    expect((await renderPage('ru', page)).hero.textContent ?? '').toContain('суббота, 28\u00a0ноября');

    vi.setSystemTime(SUNDAY_NOON);

    expect((await renderPage('ru', page)).hero.textContent ?? '').toContain('суббота, 5\u00a0декабря');
    expect(plain((await renderPage('en', page)).hero.textContent)).toContain('Saturday, December 5');
  });

  it('H3: страница рендерится на запрос — dynamic = force-dynamic', async () => {
    const { dynamic } = await loadPage();

    expect(dynamic).toBe('force-dynamic');
  });
});

describe('страница концерта — неизвестный язык', () => {
  it('N1: lang = de — notFound()', async () => {
    const { default: Page } = await loadPage();

    await expect((async () => Page({ params: Promise.resolve({ lang: 'de' }) }))()).rejects.toMatchObject({
      digest: 'NEXT_HTTP_ERROR_FALLBACK;404',
    });
  });
});

describe('страница концерта — каждая дата на странице — дата концерта', () => {
  it.each([
    { lang: 'ru' as const, day: 'суббота, 28 ноября' },
    { lang: 'en' as const, day: 'Saturday, November 28' },
  ])(
    'H4: $lang, сегодня 02.11.2026 по Калининграду — каждый <time> (первый экран и финальная плита) — 28 ноября 19:00',
    async ({ lang, day }) => {
      const { body, hero } = await renderPage(lang);
      const times = [...body.querySelectorAll('time')];

      expect(hero.querySelectorAll('time').length, '<time> в первом экране').toBeGreaterThanOrEqual(1);
      expect(times.length, '<time> в первом экране и в финальной плите').toBeGreaterThanOrEqual(2);

      times.forEach((time, index) => {
        expect(time.getAttribute('datetime'), `${index + 1}-й <time>: dateTime`).toBe('2026-11-28T17:00:00.000Z');
        expect(time.textContent, `${index + 1}-й <time>: текст`).toBe(day);
      });
    },
  );
});

/** Пункты программы из раздела «Тексты» плана: время и что происходит. */
const PROGRAM: Record<Lang, [time: string, text: string][]> = {
  ru: [
    ['18:00', 'открываем двери, работает бар'],
    ['19:00', 'первое отделение: известные джазовые мелодии'],
    ['20:00', 'антракт 20 минут'],
    ['20:20', 'второе отделение: «Огни на воде», музыка, которую квартет написал сам'],
    ['21:30', 'окончание'],
  ],
  en: [
    ['6 pm', 'doors open, the bar is open'],
    ['7 pm', 'first set: well-known jazz tunes'],
    ['8 pm', '20-minute interval'],
    ['8:20 pm', 'second set: Lights on the Water, music the quartet wrote itself'],
    ['9:30 pm', 'end'],
  ],
};

describe('страница концерта — программа вечера', () => {
  it.each(['ru', 'en'] as const)(
    'R1: %s — в #program <ol> из 5 пунктов, у каждого время и что происходит отдельными элементами',
    async (lang) => {
      const { body } = await renderPage(lang);
      const program = body.querySelector('section#program');

      expect(program, 'секция <section id="program">').not.toBeNull();

      const items = [...(program?.querySelectorAll('ol > li') ?? [])];

      expect(items).toHaveLength(5);

      PROGRAM[lang].forEach(([time, text], index) => {
        const item = items[index] as Element;
        const label = `${index + 1}-й пункт`;

        expect(item.children.length, `${label}: два дочерних элемента`).toBe(2);
        expect(plain(item.children[0]?.textContent), `${label}: время`).toBe(time);
        expect(plain(item.children[1]?.textContent), `${label}: что происходит`).toBe(plain(text));
        expect(plain(item.children[1]?.textContent).startsWith('—'), `${label}: без тире в начале`).toBe(false);
      });
    },
  );
});

const VENUE: Record<Lang, { name: string; street: string; address: string; addressNote: string }> = {
  ru: {
    name: 'Клуб «Причал 9»',
    street: 'ул. Октябрьская',
    address: 'Калининград, ул. Октябрьская',
    addressNote: 'Адрес и точка на карте — для примера: клуба «Причал 9» в Калининграде нет, как нет и самого концерта',
  },
  en: {
    name: 'Pier 9 club',
    street: 'Oktyabrskaya St',
    address: 'Oktyabrskaya St, Kaliningrad',
    addressNote:
      'The address and the map pin are only an example: there is no Pier 9 club in Kaliningrad, and no concert either',
  },
};

/** Строка финальной плиты и строка цены первого экрана — из раздела «Тексты» плана, цена самой дешевой категории. */
const FINALE: Record<Lang, { price: string; note: string; heroPriceNote: string; ticketsOnAfisha: string }> = {
  ru: {
    price: 'от 1\u00a0500\u00a0₽ · концерт вымышленный',
    note: 'от 1 500 ₽ · концерт вымышленный, поэтому кнопка откроет все события Калининграда на Яндекс Афише',
    heroPriceNote: 'от 1 500 ₽ · билеты на Яндекс Афише',
    ticketsOnAfisha: 'билеты на Яндекс Афише',
  },
  en: {
    price: 'from ₽1,500 · the concert is fictional',
    note: 'from ₽1,500 · the concert is fictional, so the button opens all Kaliningrad events on Yandex Afisha',
    heroPriceNote: 'from ₽1,500 · tickets on Yandex Afisha',
    ticketsOnAfisha: 'tickets on Yandex Afisha',
  },
};

describe('страница концерта — адрес для примера и напоминание в финале', () => {
  it.each(['ru', 'en'] as const)(
    'J4: %s — в JSON-LD ровно один MusicVenue, улица без номера дома, имя — название клуба',
    async (lang) => {
      const { body } = await renderPage(lang);
      const nodes = [...body.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) =>
        nodesOf(JSON.parse(script.textContent ?? 'null')),
      );
      const venues = nodes.filter((node) => ownTypes(node).includes('MusicVenue'));

      expect(venues, 'объектов с @type MusicVenue').toHaveLength(1);

      const [venue] = venues as [Record<string, unknown>];
      const streetAddress = (venue.address as { streetAddress?: unknown } | undefined)?.streetAddress;

      expect(streetAddress, 'address.streetAddress').toBe(VENUE[lang].street);
      expect(String(streetAddress), 'в улице нет номера дома').not.toMatch(/\d/);
      expect(venue.name, 'name').toBe(VENUE[lang].name);
    },
  );

  it.each(['ru', 'en'] as const)(
    'V1: %s — в #venue адрес без номера дома и рядом с ним строка «адрес для примера»',
    async (lang) => {
      const { body } = await renderPage(lang);
      const venue = body.querySelector('section#venue');
      const { address, addressNote } = VENUE[lang];

      expect(venue, 'секция <section id="venue">').not.toBeNull();

      const text = plain(venue?.textContent);

      expect(text, 'venue.address').toContain(plain(address));
      expect(text, 'venue.addressNote').toContain(plain(addressNote));

      /** Самые глубокие элементы с адресом: строка-пояснение — в том же элементе или у соседа. */
      const holders = [...(venue?.querySelectorAll('*') ?? [])].filter(
        (element) =>
          plain(element.textContent).includes(plain(address)) &&
          ![...element.children].some((child) => plain(child.textContent).includes(plain(address))),
      );

      expect(holders.length, 'элемент с адресом').toBeGreaterThan(0);
      expect(
        holders.some((holder) => plain(holder.parentElement?.textContent).includes(plain(addressNote))),
        'пояснение рядом с адресом — в том же блоке',
      ).toBe(true);
    },
  );

  it.each(['ru', 'en'] as const)(
    'F1: %s — в финальной плите finale.note с ценой вместо hero.priceNote; в первом экране hero.priceNote остается',
    async (lang) => {
      const { body, hero } = await renderPage(lang);
      const finale = body.querySelector('section[aria-labelledby="finale-title"]');
      const { price, note, heroPriceNote, ticketsOnAfisha } = FINALE[lang];

      expect(finale, 'финальная плита <section aria-labelledby="finale-title">').not.toBeNull();
      expect(finale?.textContent ?? '', 'цена и «концерт вымышленный»').toContain(price);
      expect(plain(finale?.textContent), 'finale.note целиком').toContain(plain(note));
      expect(plain(finale?.textContent), 'hero.priceNote в плите').not.toContain(ticketsOnAfisha);
      expect(plain(hero.textContent), 'hero.priceNote в первом экране').toContain(heroPriceNote);
    },
  );
});

/** Корневой layout читает cookie уведомления: запрос без cookie. */
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => undefined,
    has: () => false,
    getAll: () => [],
  }),
}));

/** Шрифт next/font собирает компилятор Next; в Vitest его нет. */
vi.mock('next/font/local', () => ({
  default: () => ({ className: 'font', variable: 'font-variable', style: { fontFamily: 'Font' } }),
}));

type LayoutElement = { type: unknown; props: { lang?: unknown } };

type LayoutModule = {
  default: (props: { children: ReactNode; params: Promise<{ lang: string }> }) => ReactNode | Promise<ReactNode>;
};

describe('корневой layout концерта — язык документа', () => {
  it.each(['ru', 'en'] as const)('W1: %s — layout возвращает <html> с lang языка страницы', async (lang) => {
    const { default: Layout } = await importEvent<LayoutModule>('app/(site)/[lang]/layout.tsx');
    const element = (await Layout({ children: null, params: Promise.resolve({ lang }) })) as LayoutElement;

    expect(element.type).toBe('html');
    expect(element.props.lang).toBe(lang);
  });
});

type ProxyModule = { default: (request: import('next/server').NextRequest) => Response | Promise<Response> };

describe('proxy концерта — адреса без языка ведут на русскую версию', () => {
  const callProxy = async (pathname: string) => {
    const { NextRequest } = await import('next/server');
    const { default: proxy } = await importEvent<ProxyModule>('proxy.ts');

    return proxy(new NextRequest(`http://localhost${pathname}`));
  };

  it.each([
    { pathname: '/', target: '/ru' },
    { pathname: '/privacy', target: '/ru/privacy' },
  ])('W2: $pathname — 308 на $target', async ({ pathname, target }) => {
    const response = await callProxy(pathname);

    expect(response.status).toBe(308);
    expect(new URL(response.headers.get('location') ?? '', 'http://localhost').pathname).toBe(target);
  });

  it('W2: /en — не редирект', async () => {
    const response = await callProxy('/en');

    expect(response.headers.get('location')).toBeNull();
    expect(response.status >= 300 && response.status < 400, `статус ${response.status}`).toBe(false);
  });
});
