/** @vitest-environment happy-dom */
import { LowVisionPanel } from '@mrshkn/demo-core/components/LowVisionPanel';
import { LowVisionToggle } from '@mrshkn/demo-core/components/LowVisionToggle';
import {
  LOW_VISION_COOKIE,
  LOW_VISION_DEFAULTS,
  LOW_VISION_SCHEMES,
  lowVisionAttributes,
  parseLowVision,
  serializeLowVision,
  type LowVisionSettings,
} from '@mrshkn/demo-core/low-vision';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Имя cookie — из контракта, а не из модуля: модуль с другим именем должен уронить тест, а не подстроить его. */
const COOKIE = 'low_vision';

const PANEL_LABEL = 'Настройки версии для слабовидящих';

const TOGGLE_LABEL = 'Версия для слабовидящих';

const FONTS = ['100', '150', '200'] as const;

const SCHEMES = ['black-on-white', 'white-on-black', 'blue-on-lightblue'] as const;

const IMAGES = ['on', 'off'] as const;

const ALL_SETTINGS: LowVisionSettings[] = FONTS.flatMap((font) =>
  SCHEMES.flatMap((scheme) => IMAGES.map((images) => ({ font, scheme, images }))),
);

const LV_ATTRIBUTES = ['data-low-vision', 'data-lv-font', 'data-lv-scheme', 'data-lv-images'];

const CORE_SRC = path.resolve(import.meta.dirname, '../../packages/core/src');

const HEX = /^#[0-9a-f]{6}$/i;

/** Подписи кнопок с неразрывными пробелами типографа сравниваются как с обычными. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/ /g, ' ').trim();

let root: Root | null = null;

/**
 * happy-dom считает cookie с `max-age=0` живой до конца текущей миллисекунды: сброс между тестами — датой в прошлом,
 * а проверка удаления ждет, пока миллисекунда пройдет.
 */
const COOKIE_EXPIRED = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';

const cookieClockTick = () => new Promise((resolve) => setTimeout(resolve, 5));

const resetDocument = () => {
  document.cookie = `${COOKIE}=; ${COOKIE_EXPIRED}; path=/`;

  const html = document.documentElement;

  for (const name of html.getAttributeNames()) {
    if (name.startsWith('data-') || name === 'style') {
      html.removeAttribute(name);
    }
  }

  document.body.innerHTML = '';
};

const mount = async (node: ReactNode) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(node);
  });
};

const panel = () =>
  document.querySelector(`[role="region"][aria-label="${PANEL_LABEL}"], section[aria-label="${PANEL_LABEL}"]`);

/** Кнопка по доступному имени: `aria-label`, а без него — видимая подпись. */
const button = (name: string, scope: ParentNode | null = document) =>
  [...(scope?.querySelectorAll('button') ?? [])].find(
    (candidate) => plain(candidate.getAttribute('aria-label') ?? candidate.textContent) === name,
  ) ?? null;

const press = async (name: string, scope: ParentNode | null = panel()) => {
  const target = button(name, scope);

  expect(target, `кнопка «${name}»`).not.toBeNull();
  await act(async () => {
    target?.click();
  });

  return target;
};

/** Значение cookie так, как его отдаст сервер: `cookies()` Next декодирует значение. */
const cookieValue = () => {
  const pair = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`));

  return pair === undefined ? undefined : decodeURIComponent(pair.slice(COOKIE.length + 1));
};

const YEAR_SECONDS = 365 * 24 * 60 * 60;

/**
 * Атрибуты записи cookie видны только в сеттере `document.cookie`: чтение отдает одни пары. Без `path=/` выбор,
 * сделанный на странице врача, сервер не увидит на главной.
 */
const watchCookieWrites = () => {
  const setter = vi.spyOn(document, 'cookie', 'set');

  return () => setter.mock.calls.map(([write]) => String(write)).filter((write) => write.startsWith(`${COOKIE}=`));
};

const attributesOf = (write: string | undefined) =>
  Object.fromEntries(
    (write ?? '')
      .split(';')
      .slice(1)
      .map((part) => {
        const [name = '', value = ''] = part.trim().split('=');

        return [name.toLowerCase(), value.toLowerCase()];
      }),
  );

/** Запись выбора: на весь сайт, на год, без отправки с чужих сайтов. */
const expectStoredForYear = (write: string | undefined) => {
  const attributes = attributesOf(write);

  expect(write, `запись cookie ${COOKIE}`).toBeDefined();
  expect(attributes.path, 'path').toBe('/');
  expect(attributes.samesite, 'samesite').toBe('lax');
  expect(Number(attributes['max-age']), 'max-age — год').toBeGreaterThanOrEqual(YEAR_SECONDS);
  expect(Number(attributes['max-age']), 'max-age — год').toBeLessThanOrEqual(YEAR_SECONDS + 24 * 60 * 60);
};

const htmlAttribute = (name: string) => document.documentElement.getAttribute(name);

const channel = (value: number) => {
  const srgb = value / 255;

  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

/** Относительная яркость sRGB по WCAG 2.1. */
const luminance = (hex: string) => {
  const [red, green, blue] = [1, 3, 5].map((start) => channel(Number.parseInt(hex.slice(start, start + 2), 16)));

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrast = (first: string, second: string) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
};

beforeEach(resetDocument);

afterEach(async () => {
  vi.restoreAllMocks();
  await act(async () => {
    root?.unmount();
  });
  root = null;
  resetDocument();
});

describe('настройки версии для слабовидящих — значение cookie и атрибуты <html>', () => {
  it.each(ALL_SETTINGS)(
    'L1: $font / $scheme / $images — разбор записанного значения дает те же настройки',
    (settings) => {
      expect(parseLowVision(serializeLowVision(settings))).toEqual(settings);
    },
  );

  const forged = serializeLowVision(LOW_VISION_DEFAULTS);

  it.each([
    { label: 'нет cookie', value: undefined },
    { label: 'пустая строка', value: '' },
    { label: 'мусор', value: 'мусор' },
    { label: 'неизвестный размер шрифта', value: forged.replace('150', '175') },
    { label: 'лишняя четвертая часть', value: `${forged}.x` },
    { label: 'неизвестная схема', value: forged.replace('black-on-white', 'purple') },
    { label: 'неизвестное значение картинок', value: forged.replace(/on$/, 'maybe') },
  ])('L2: битая cookie ($label) — режим не включается: null', ({ label, value }) => {
    if (label !== 'нет cookie' && label !== 'пустая строка' && label !== 'мусор') {
      expect(value, 'подмена части значения по умолчанию что-то меняет').not.toBe(forged);
    }

    expect(parseLowVision(value)).toBeNull();
  });

  it('L3: без настроек атрибутов нет; с настройками — data-low-vision и значение каждой настройки', () => {
    expect(lowVisionAttributes(null)).toEqual({});
    expect(lowVisionAttributes({ font: '200', scheme: 'white-on-black', images: 'off' })).toMatchObject({
      'data-low-vision': 'on',
      'data-lv-font': '200',
      'data-lv-scheme': 'white-on-black',
      'data-lv-images': 'off',
    });
  });

  it('L4: cookie low_vision; значок включает крупный шрифт, черным по белому, с картинками', () => {
    expect(LOW_VISION_COOKIE).toBe('low_vision');
    expect(LOW_VISION_DEFAULTS).toEqual({ font: '150', scheme: 'black-on-white', images: 'on' });
  });

  it.each(SCHEMES)('L5: схема %s — контраст текста и акцента к фону не ниже 7:1', (scheme) => {
    const colors = LOW_VISION_SCHEMES[scheme];

    expect(colors, `цвета схемы ${scheme} — hex #rrggbb`).toEqual({
      text: expect.stringMatching(HEX),
      background: expect.stringMatching(HEX),
      accent: expect.stringMatching(HEX),
    });

    if (!colors) {
      return;
    }

    expect(contrast(colors.text, colors.background), 'текст / фон').toBeGreaterThanOrEqual(7);
    expect(contrast(colors.accent, colors.background), 'акцент / фон').toBeGreaterThanOrEqual(7);
  });
});

describe('панель версии для слабовидящих', () => {
  const mountDefaults = () => mount(<LowVisionPanel initial={LOW_VISION_DEFAULTS} />);

  const expectCookie = (expected: LowVisionSettings) => {
    const value = cookieValue();

    expect(value, `cookie ${COOKIE}`).toBeDefined();
    expect(parseLowVision(value)).toEqual(expected);
  };

  it('L6: режим включен — панель с выбранными настройками нажата', async () => {
    await mountDefaults();

    const region = panel();

    expect(region, `панель «${PANEL_LABEL}»`).not.toBeNull();
    expect(button('A+, крупный шрифт', region)?.getAttribute('aria-pressed')).toBe('true');
    expect(button('A, обычный шрифт', region)?.getAttribute('aria-pressed')).toBe('false');
    expect(button('A++, очень крупный шрифт', region)?.getAttribute('aria-pressed')).toBe('false');
    expect(button('Черным по белому', region)?.getAttribute('aria-pressed')).toBe('true');
    expect(button('Показать', region)?.getAttribute('aria-pressed')).toBe('true');
  });

  it('L7: «Очень крупный шрифт» — шрифт 200 на <html> и в cookie, кнопка нажата', async () => {
    await mountDefaults();

    const writes = watchCookieWrites();
    const pressed = await press('A++, очень крупный шрифт');

    expect(htmlAttribute('data-lv-font')).toBe('200');
    expect(htmlAttribute('data-low-vision')).toBe('on');
    expect(document.cookie).toContain(`${COOKIE}=`);
    expectCookie({ ...LOW_VISION_DEFAULTS, font: '200' });
    expectStoredForYear(writes().at(-1));
    expect(pressed?.getAttribute('aria-pressed')).toBe('true');
  });

  it('L8: затем «Белым по черному» — схема на <html> и в cookie, шрифт прежний', async () => {
    await mountDefaults();
    await press('A++, очень крупный шрифт');
    await press('Белым по черному');

    expect(htmlAttribute('data-lv-scheme')).toBe('white-on-black');
    expectCookie({ font: '200', scheme: 'white-on-black', images: 'on' });

    const { style } = document.documentElement;
    const { text, background } = LOW_VISION_SCHEMES['white-on-black'];

    expect(style.getPropertyValue('--lv-text').trim().toLowerCase(), 'цвет текста схемы').toBe(text.toLowerCase());
    expect(style.getPropertyValue('--lv-bg').trim().toLowerCase(), 'цвет фона схемы').toBe(background.toLowerCase());
  });

  it('L9: затем «Скрыть» картинки — на <html> и в cookie', async () => {
    await mountDefaults();
    await press('A++, очень крупный шрифт');
    await press('Белым по черному');
    await press('Скрыть');

    expect(htmlAttribute('data-lv-images')).toBe('off');
    expectCookie({ font: '200', scheme: 'white-on-black', images: 'off' });
  });

  it('L10: затем «Обычный вид сайта» — атрибутов, cookie и панели нет', async () => {
    await mountDefaults();
    await press('A++, очень крупный шрифт');
    await press('Белым по черному');
    await press('Скрыть');

    const writes = watchCookieWrites();

    await press('Обычный вид сайта');
    await cookieClockTick();

    for (const name of LV_ATTRIBUTES) {
      expect(document.documentElement.hasAttribute(name), name).toBe(false);
    }

    expect(document.cookie).not.toContain(`${COOKIE}=`);
    expect(attributesOf(writes().at(-1)).path, 'удаление — с path=/, иначе cookie сайта останется').toBe('/');
    expect(panel()).toBeNull();
  });

  it('L11: значок без перезагрузки включает режим по умолчанию и показывает панель', async () => {
    await mount(
      <>
        <LowVisionToggle />
        <LowVisionPanel initial={null} />
      </>,
    );

    expect(panel(), 'до нажатия значка панели нет').toBeNull();

    const writes = watchCookieWrites();

    await press(TOGGLE_LABEL, document);

    expect(htmlAttribute('data-low-vision')).toBe('on');
    expect(htmlAttribute('data-lv-font')).toBe('150');
    expect(htmlAttribute('data-lv-scheme')).toBe('black-on-white');
    expect(htmlAttribute('data-lv-images')).toBe('on');

    for (const [name, value] of Object.entries(lowVisionAttributes(LOW_VISION_DEFAULTS))) {
      if (name.startsWith('data-')) {
        expect(htmlAttribute(name), name).toBe(value);
      }
    }

    expectCookie(LOW_VISION_DEFAULTS);
    expectStoredForYear(writes().at(-1));
    expect(panel(), `панель «${PANEL_LABEL}» после нажатия`).not.toBeNull();
  });
});

describe('стили версии для слабовидящих', () => {
  it('L12: в SCSS ядра есть правила на каждый размер шрифта, каждую схему и скрытые картинки', () => {
    const scss = (readdirSync(CORE_SRC, { recursive: true }) as string[])
      .filter((file) => file.endsWith('.scss'))
      .map((file) => readFileSync(path.join(CORE_SRC, file), 'utf8'))
      .join('\n');
    const required = [
      ...FONTS.map((value) => ['font', value]),
      ...SCHEMES.map((value) => ['scheme', value]),
      ['images', 'off'],
    ];
    const missing = required
      .filter(([name, value]) => !new RegExp(String.raw`\[data-lv-${name}=(['"])${value}\1\]`).test(scss))
      .map(([name, value]) => `[data-lv-${name}='${value}']`);

    expect(missing, 'селекторы без правил').toEqual([]);
  });
});
