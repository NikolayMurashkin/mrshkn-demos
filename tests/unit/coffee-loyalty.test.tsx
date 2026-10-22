/** @vitest-environment happy-dom */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type PageMetadata = { title?: unknown; description?: unknown };

type PageModule = {
  default: () => ReactNode | Promise<ReactNode>;
  generateMetadata?: () => PageMetadata | Promise<PageMetadata>;
};

type ConstsModule = { LOYALTY: { text: string } };

const COFFEE_DIR = path.resolve(import.meta.dirname, '../../apps/coffee');

const COFFEE_SRC = path.join(COFFEE_DIR, 'src');

/** Модуль демо «Кофейня»: нет файла — тест падает на assert, а не на сборке. */
const importCoffee = async <T,>(relative: string): Promise<T> => {
  const file = path.join(COFFEE_SRC, relative);

  expect(existsSync(file), `нет apps/coffee/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const loadPage = () => importCoffee<PageModule>('app/(site)/loyalty/page.tsx');

const TELEGRAM_ENV = 'LOYALTY_TELEGRAM_URL';

const MAX_ENV = 'LOYALTY_MAX_URL';

const TELEGRAM_URL = 'https://t.me/gusha_demo_bot?startapp';

const MAX_URL = 'https://max.ru/gusha_demo_bot?startapp';

const TELEGRAM_LABEL = 'Открыть в Telegram';

const MAX_LABEL = 'Открыть в MAX';

const STUB_PHRASE = 'загляните позже';

const LOYALTY_PHRASE = 'Каждая 10-я чашка — от нас';

/** Текст с обычными пробелами вместо неразрывных: типограф ставит их по-своему. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/[  ]/g, ' ');

/** `undefined` — переменной нет в окружении. */
const setEnv = (telegram: string | undefined, max: string | undefined) => {
  vi.stubEnv(TELEGRAM_ENV, telegram);
  vi.stubEnv(MAX_ENV, max);
};

/** Страница отрисовывается после того, как окружение задано: адрес из Coolify читается на запрос, не на сборке. */
const render = async (page?: PageModule) => {
  const { default: LoyaltyPage } = page ?? (await loadPage());
  const markup = renderToStaticMarkup(<>{await LoyaltyPage()}</>);
  const body = new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;
  const anchors = [...body.querySelectorAll('a')];

  return { body, anchors, text: plain(body.textContent) };
};

type Rendered = Awaited<ReturnType<typeof render>>;

const linksWith = ({ anchors }: Rendered, label: string) =>
  anchors.filter((anchor) => plain(anchor.textContent).includes(label));

const hrefsOf = (anchors: Element[]) => anchors.map((anchor) => anchor.getAttribute('href'));

/** Без адресов ботов — заглушка: прежний текст целиком и ни одной кнопки «Открыть в …». */
const expectStub = async (page: Rendered) => {
  const { LOYALTY } = await importCoffee<ConstsModule>('consts.ts');

  expect(page.text).toContain(plain(LOYALTY.text));
  expect(page.text).toContain(STUB_PHRASE);
  expect(page.text).toContain(LOYALTY_PHRASE);
  expect(linksWith(page, 'Открыть в'), 'кнопок «Открыть в …» нет').toEqual([]);
};

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('страница /loyalty — кнопки Mini App «Лояльность»', () => {
  it('L1: заданы оба адреса — по одной кнопке «Открыть в Telegram» и «Открыть в MAX» с этими адресами', async () => {
    setEnv(TELEGRAM_URL, MAX_URL);

    const page = await render();

    expect(hrefsOf(linksWith(page, TELEGRAM_LABEL))).toEqual([TELEGRAM_URL]);
    expect(hrefsOf(linksWith(page, MAX_LABEL))).toEqual([MAX_URL]);
  });

  it('L2: заданы оба адреса — фразы заглушки «загляните позже» нет, текст про 10-ю чашку остается', async () => {
    setEnv(TELEGRAM_URL, MAX_URL);

    const { text } = await render();

    expect(text).not.toContain(STUB_PHRASE);
    expect(text).toContain(LOYALTY_PHRASE);
  });

  it('L3: адресов нет в окружении — текст заглушки целиком, кнопок «Открыть в …» нет', async () => {
    setEnv(undefined, undefined);

    await expectStub(await render());
  });

  it('L4: адреса — пустая строка или пробелы — как без адресов', async () => {
    setEnv('', '');

    await expectStub(await render());

    setEnv('  ', '  ');

    await expectStub(await render());
  });

  it('L5: задан только Telegram — его кнопка с адресом, кнопки MAX нет, фразы заглушки нет', async () => {
    setEnv(TELEGRAM_URL, undefined);

    const page = await render();

    expect(hrefsOf(linksWith(page, TELEGRAM_LABEL))).toEqual([TELEGRAM_URL]);
    expect(linksWith(page, MAX_LABEL)).toEqual([]);
    expect(page.text).not.toContain(STUB_PHRASE);
  });

  it('L6: задан только MAX — его кнопка с адресом, кнопки Telegram нет, фразы заглушки нет', async () => {
    setEnv(undefined, MAX_URL);

    const page = await render();

    expect(hrefsOf(linksWith(page, MAX_LABEL))).toEqual([MAX_URL]);
    expect(linksWith(page, TELEGRAM_LABEL)).toEqual([]);
    expect(page.text).not.toContain(STUB_PHRASE);
  });

  it('L7: адреса с пробелами по краям — href без пробелов', async () => {
    setEnv('  https://t.me/x?startapp  ', '  https://max.ru/x?startapp  ');

    const page = await render();

    expect(hrefsOf(linksWith(page, TELEGRAM_LABEL))).toEqual(['https://t.me/x?startapp']);
    expect(hrefsOf(linksWith(page, MAX_LABEL))).toEqual(['https://max.ru/x?startapp']);
  });

  it('L8: адрес javascript: и адрес http:// — как без адресов', async () => {
    const telegram = 'javascript:alert(1)';
    const max = 'http://max.ru/x';

    setEnv(telegram, max);

    const page = await render();

    await expectStub(page);
    expect(hrefsOf(page.anchors)).not.toContain(telegram);
    expect(hrefsOf(page.anchors)).not.toContain(max);
  });

  it.each([
    { variant: 'оба адреса', telegram: TELEGRAM_URL, max: MAX_URL, labels: [TELEGRAM_LABEL, MAX_LABEL] },
    { variant: 'без адресов', telegram: undefined, max: undefined, labels: [] },
    { variant: 'только Telegram', telegram: TELEGRAM_URL, max: undefined, labels: [TELEGRAM_LABEL] },
    { variant: 'только MAX', telegram: undefined, max: MAX_URL, labels: [MAX_LABEL] },
  ])(
    'L9: $variant — ни одной ссылки с href="#" или пустым href, каждая «Открыть в …» ведет на https://',
    async ({ telegram, max, labels }) => {
      setEnv(telegram, max);

      const page = await render();

      for (const label of labels) {
        expect(linksWith(page, label).length, `кнопка «${label}»`).toBeGreaterThan(0);
      }

      for (const href of hrefsOf(page.anchors)) {
        expect(href, 'у ссылки есть адрес').not.toBeNull();
        expect(href?.trim(), 'адрес не пустой').not.toBe('');
        expect(href, 'адрес не «#»').not.toBe('#');
      }

      for (const href of hrefsOf(linksWith(page, 'Открыть в'))) {
        expect(href?.startsWith('https://'), `${href} — https://`).toBe(true);
      }
    },
  );

  it('L10: с адресами и без — кнопка «Вернуться в меню» ведет на /menu', async () => {
    setEnv(TELEGRAM_URL, MAX_URL);

    expect(hrefsOf(linksWith(await render(), 'Вернуться в меню'))).toEqual(['/menu']);

    setEnv(undefined, undefined);

    expect(hrefsOf(linksWith(await render(), 'Вернуться в меню'))).toEqual(['/menu']);
  });

  it('L11: адрес задан после импорта модуля страницы — кнопка с этим адресом есть', async () => {
    setEnv(undefined, undefined);

    const imported = await loadPage();

    setEnv(TELEGRAM_URL, MAX_URL);

    const page = await render(imported);

    expect(hrefsOf(linksWith(page, TELEGRAM_LABEL))).toEqual([TELEGRAM_URL]);
    expect(hrefsOf(linksWith(page, MAX_LABEL))).toEqual([MAX_URL]);
  });
});

/** Заголовок и описание называют только мессенджеры с заданным ботом; без адресов — заглушка про оба. */
const MESSENGER_VARIANTS = [
  { variant: 'оба адреса', telegram: TELEGRAM_URL, max: MAX_URL, messengers: 'Telegram и MAX' },
  { variant: 'только Telegram', telegram: TELEGRAM_URL, max: undefined, messengers: 'Telegram' },
  { variant: 'только MAX', telegram: undefined, max: MAX_URL, messengers: 'MAX' },
  { variant: 'без адресов', telegram: undefined, max: undefined, messengers: 'Telegram и MAX' },
];

describe('заголовок и описание /loyalty — по заданным ботам', () => {
  it.each(MESSENGER_VARIANTS)(
    'L13: $variant — H1 «Карта лояльности — в $messengers»',
    async ({ telegram, max, messengers }) => {
      setEnv(telegram, max);

      const { body } = await render();

      expect(plain(body.querySelector('h1')?.textContent)).toBe(`Карта лояльности — в ${messengers}`);
    },
  );

  it.each(MESSENGER_VARIANTS)(
    'L14: $variant — generateMetadata: description «… Карта лояльности в $messengers», title «Карта лояльности»',
    async ({ telegram, max, messengers }) => {
      setEnv(telegram, max);

      const { generateMetadata } = await loadPage();

      expect(typeof generateMetadata, 'страница экспортирует generateMetadata').toBe('function');

      const metadata: PageMetadata = (await generateMetadata?.()) ?? {};

      expect(metadata.title).toBe('Карта лояльности');
      expect(plain(String(metadata.description))).toBe(`Каждая 10-я чашка — от нас. Карта лояльности в ${messengers}.`);
    },
  );
});

describe('.env.example кофейни', () => {
  it('L12: описывает адреса обоих ботов', () => {
    const example = readFileSync(path.join(COFFEE_DIR, '.env.example'), 'utf8');

    expect(example).toMatch(/^#?\s*LOYALTY_TELEGRAM_URL=/m);
    expect(example).toMatch(/^#?\s*LOYALTY_MAX_URL=/m);
  });
});
