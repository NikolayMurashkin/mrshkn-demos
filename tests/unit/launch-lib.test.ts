import { NBSP } from '@mrshkn/demo-core/consts';
import { typograph } from '@mrshkn/demo-core/typograph';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

type DocPage = { slug: string };

type NavItem = { href: string; label: string; section?: string };

const LAUNCH_SRC = path.resolve(import.meta.dirname, '../../apps/launch/src');

/** Модуль демо «SaaS-лендинг»: пока его нет, тест падает на assert, а не на сборке файла. */
const importLaunch = async <T>(relative: string): Promise<T> => {
  const file = path.join(LAUNCH_SRC, relative);

  expect(existsSync(file), `нет apps/launch/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let formatPlanPrice: (plan: { amount: number; from: boolean }) => string;
let typographContent: <T>(value: T) => T;
let docNeighbours: (slug: string) => { prev?: DocPage; next?: DocPage };
let docHref: (slug: string) => string;
let findDocPage: (slug: string) => DocPage | undefined;
let isCurrent: (pathname: string, item: NavItem) => boolean;

beforeAll(async () => {
  ({ formatPlanPrice } = await importLaunch<{ formatPlanPrice: typeof formatPlanPrice }>('lib/format.ts'));
  ({ typographContent } = await importLaunch<{ typographContent: typeof typographContent }>(
    'lib/typograph-content.ts',
  ));
  ({ docNeighbours, docHref, findDocPage } = await importLaunch<{
    docNeighbours: typeof docNeighbours;
    docHref: typeof docHref;
    findDocPage: typeof findDocPage;
  }>('lib/docs.ts'));
});

const RAW_KEYS = ['href', 'section', 'command', 'code', 'prompt', 'id', 'slug', 'date', 'version', 'wordmark'];

const slugOf = (page: DocPage | undefined) => page?.slug;

describe('цена тарифа', () => {
  it.each([
    [{ amount: 0, from: false }, `0${NBSP}₽`],
    [{ amount: 2900, from: false }, `2${NBSP}900${NBSP}₽`],
    [{ amount: 14900, from: true }, `от${NBSP}14${NBSP}900${NBSP}₽`],
    [{ amount: 1234567, from: false }, `1${NBSP}234${NBSP}567${NBSP}₽`],
  ])('L1: %o — %s, каждый пробел неразрывный', (plan, expected) => {
    const price = formatPlanPrice(plan);

    expect(price).toBe(expected);
    expect(price).not.toMatch(/[  ]/);
  });
});

describe('типограф контента', () => {
  it('L2: тексты получают неразрывные пробелы, адреса, команды и slug — байт в байт, и внутри массива', () => {
    const source = {
      title: 'Флаг в один клик',
      href: '/docs/start в работе',
      command: 'flagshtok init в prod',
      items: [{ text: 'а — б', slug: 'a и b' }],
    };
    const result = typographContent(source);

    expect(result.title).toBe(typograph('Флаг в один клик'));
    expect(result.title).toContain(NBSP);
    expect(result.items[0].text).toBe(typograph('а — б'));
    expect(result.items[0].text).toContain(NBSP);
    expect(result.href).toBe('/docs/start в работе');
    expect(result.command).toBe('flagshtok init в prod');
    expect(result.items[0].slug).toBe('a и b');
  });

  it.each(RAW_KEYS)('L3: строка под ключом %s не меняется', (key) => {
    expect(typographContent({ [key]: 'в и к' })).toEqual({ [key]: 'в и к' });
  });

  it('L3: строка под ключом text проходит типограф', () => {
    const result = typographContent({ text: 'в и к' });

    expect(result.text).toBe(typograph('в и к'));
    expect(result.text).not.toBe('в и к');
  });

  it('L4: числа, true и null возвращаются как есть, исходный объект не меняется', () => {
    const source = { amount: 2900, from: true, note: null, title: 'в и к', items: [{ count: 3, text: 'а — б' }] };
    const snapshot = structuredClone(source);
    const result = typographContent(source);

    expect(result.amount).toBe(2900);
    expect(result.from).toBe(true);
    expect(result.note).toBeNull();
    expect(result.items[0].count).toBe(3);
    expect(source).toEqual(snapshot);
  });
});

describe('соседние разделы документации', () => {
  it.each([
    ['start', undefined, 'flags'],
    ['flags', 'start', 'rollout'],
    ['rollout', 'flags', undefined],
  ])('L5: у %s предыдущий — %s, следующий — %s', (slug, prev, next) => {
    const neighbours = docNeighbours(slug);

    expect({ prev: slugOf(neighbours.prev), next: slugOf(neighbours.next) }).toEqual({ prev, next });
  });

  it('L6: у неизвестного раздела соседей нет; адрес раздела и поиск по slug', () => {
    expect(docNeighbours('nope')).toEqual({ prev: undefined, next: undefined });
    expect(docHref('flags')).toBe('/docs/flags');
    expect(findDocPage('nope')).toBeUndefined();
  });
});

describe('текущий пункт меню', () => {
  beforeAll(async () => {
    ({ isCurrent } = await importLaunch<{ isCurrent: typeof isCurrent }>('lib/nav.ts'));
  });

  it('L7: пункт раздела текущий на его страницах, якорь главной — никогда', () => {
    const docs: NavItem = { href: '/docs/start', label: 'Документация', section: '/docs' };
    const anchor: NavItem = { href: '/#features', label: 'Возможности' };

    expect(isCurrent('/docs', docs)).toBe(true);
    expect(isCurrent('/docs/flags', docs)).toBe(true);
    expect(isCurrent('/', docs)).toBe(false);
    expect(isCurrent('/docsx', docs)).toBe(false);
    expect(isCurrent('/privacy', docs)).toBe(false);

    for (const pathname of ['/', '/docs', '/docs/flags', '/privacy']) {
      expect(isCurrent(pathname, anchor), pathname).toBe(false);
    }
  });
});
