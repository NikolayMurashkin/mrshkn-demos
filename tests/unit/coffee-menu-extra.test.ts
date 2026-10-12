import { describe, expect, it } from 'vitest';
import { validateMenuSlug, validatePrice } from '../../apps/coffee/src/cms/validate';
import { firstOfEachCategory, groupMenu, menuHref, toggleTag } from '../../apps/coffee/src/lib/menu';
import { qrSvg } from '../../apps/coffee/src/lib/qr';

type MenuItem = {
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
};

const item = (slug: string, category: string): MenuItem => ({ slug, name: slug, price: 100, category, tags: [] });

const A = item('a', 'coffee');
const B = item('b', 'coffee');
const C = item('c', 'tea');

/** Порядок позиций (кофе раньше чая) и порядок категорий (чай раньше кофе) нарочно разные. */
const ITEMS: MenuItem[] = [A, B, C];

const TEA = { slug: 'tea', name: 'Чай' };
const COFFEE = { slug: 'coffee', name: 'Кофе' };
const BAKERY = { slug: 'bakery', name: 'Выпечка' };

const CATEGORIES = [TEA, COFFEE, BAKERY];

describe('демо «Кофейня»: меню по категориям', () => {
  it('M1: первая позиция каждой категории в порядке категорий, пустая категория пропущена', () => {
    expect(firstOfEachCategory(ITEMS, CATEGORIES)).toEqual([
      { category: TEA, item: C },
      { category: COFFEE, item: A },
    ]);
  });

  it('M2: группы в порядке категорий, позиции в исходном порядке, без пустой категории', () => {
    expect(groupMenu(ITEMS, CATEGORIES)).toEqual([
      { category: TEA, items: [C] },
      { category: COFFEE, items: [A, B] },
    ]);
  });
});

describe('демо «Кофейня»: ссылки фильтра', () => {
  it('M3: адрес меню из фильтра — категория, каждый признак, qr=1; пустой фильтр — /menu', () => {
    expect(menuHref({ category: 'tea', tags: ['oat', 'no-sugar'], qr: true })).toBe(
      '/menu?category=tea&tag=oat&tag=no-sugar&qr=1',
    );
    expect(menuHref({ category: undefined, tags: [], qr: false })).toBe('/menu');
  });

  it('M4: выбранный признак снимается, невыбранный добавляется в конец', () => {
    expect(toggleTag(['oat'], 'oat')).toEqual([]);
    expect(toggleTag(['oat'], 'vegan')).toEqual(['oat', 'vegan']);
  });
});

/** Ошибка валидатора Payload — непустая строка; `true` — значение принято. */
const expectError = (result: unknown, value: unknown) => {
  expect(typeof result, `значение ${JSON.stringify(value)} должно отклоняться`).toBe('string');
  expect(result, `значение ${JSON.stringify(value)}: текст ошибки`).not.toBe('');
};

describe('демо «Кофейня»: проверки полей позиции', () => {
  it('V1: цена — целое число рублей больше нуля', async () => {
    expect(await validatePrice(250, {} as never)).toBe(true);

    for (const value of [0, -5, 249.5, undefined, null]) {
      expectError(await validatePrice(value, {} as never), value);
    }
  });

  it('V2: код позиции — латиница в нижнем регистре, цифры и дефис между ними', async () => {
    for (const value of ['flat-white', 'syrniki', 'v60']) {
      expect(await validateMenuSlug(value, {} as never), value).toBe(true);
    }

    for (const value of ['Flat-White', 'flat white', '-latte', 'latte-', 'латте', '']) {
      expectError(await validateMenuSlug(value, {} as never), value);
    }
  });
});

describe('демо «Кофейня»: SVG QR-кода плаката — qrSvg', () => {
  it('Q3: модули цвета текста, скрыт от скринридера, без литерального черного и без фона', async () => {
    const svg = await qrSvg('https://coffee.mrshkn.com/menu?qr=1');

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).not.toContain('#000000');

    const opaqueFills = (svg.match(/<[^>]+>/g) ?? []).filter((tag) => {
      const fill = /\sfill="([^"]*)"/.exec(tag)?.[1];

      if (fill === undefined || fill === 'none' || fill === 'transparent') {
        return false;
      }

      const opacity = /\sfill-opacity="([^"]*)"/.exec(tag)?.[1];

      return opacity === undefined || Number(opacity) !== 0;
    });

    expect(opaqueFills, 'элементы с непрозрачной заливкой (фон под кодом)').toEqual([]);
  });
});
