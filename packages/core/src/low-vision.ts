import type { CSSProperties } from 'react';
import { LOW_VISION_COOKIE, LOW_VISION_DEFAULTS, LOW_VISION_MAX_AGE, LOW_VISION_SCHEMES } from './consts';
import type { LowVisionFont, LowVisionImages, LowVisionScheme, LowVisionSettings } from './types';

export { LOW_VISION_COOKIE, LOW_VISION_DEFAULTS, LOW_VISION_SCHEMES };

export type { LowVisionColors, LowVisionFont, LowVisionImages, LowVisionScheme, LowVisionSettings } from './types';

export const LOW_VISION_FONTS: LowVisionFont[] = ['100', '150', '200'];

export const LOW_VISION_SCHEME_NAMES = Object.keys(LOW_VISION_SCHEMES) as LowVisionScheme[];

export const LOW_VISION_IMAGES: LowVisionImages[] = ['on', 'off'];

/** Атрибуты `<html>`, по которым CSS включает режим; их же снимает «Обычный вид сайта». */
const LOW_VISION_ATTRIBUTES = ['data-low-vision', 'data-lv-font', 'data-lv-scheme', 'data-lv-images'];

/** Переменные цветов текущей схемы на `<html>`. */
const LOW_VISION_VARIABLES = ['--lv-text', '--lv-bg', '--lv-accent'];

const SEPARATOR = '.';

/** Значение cookie: `шрифт.схема.картинки`, например `150.black-on-white.on`. */
export const serializeLowVision = ({ font, scheme, images }: LowVisionSettings) =>
  [font, scheme, images].join(SEPARATOR);

const isOneOf = <T extends string>(values: readonly T[], value: string | undefined): value is T =>
  value !== undefined && (values as readonly string[]).includes(value);

/** Битая или чужая cookie — обычная версия сайта, а не режим с половиной настроек. */
export const parseLowVision = (value: string | undefined): LowVisionSettings | null => {
  const [font, scheme, images, ...rest] = (value ?? '').split(SEPARATOR);

  if (
    rest.length > 0 ||
    !isOneOf(LOW_VISION_FONTS, font) ||
    !isOneOf(LOW_VISION_SCHEME_NAMES, scheme) ||
    !isOneOf(LOW_VISION_IMAGES, images)
  ) {
    return null;
  }

  return { font, scheme, images };
};

export const lowVisionAttributes = (settings: LowVisionSettings | null): Record<string, string> =>
  settings
    ? {
        'data-low-vision': 'on',
        'data-lv-font': settings.font,
        'data-lv-scheme': settings.scheme,
        'data-lv-images': settings.images,
      }
    : {};

/** Цвета схемы переменными: в SCSS цветов-литералов нет, источник — `LOW_VISION_SCHEMES`. */
const lowVisionVariables = (settings: LowVisionSettings | null): Record<string, string> => {
  if (!settings) {
    return {};
  }

  const { text, background, accent } = LOW_VISION_SCHEMES[settings.scheme];

  return { '--lv-text': text, '--lv-bg': background, '--lv-accent': accent };
};

/** Стиль `<html>` для сервера: React принимает `style` только объектом. */
export const lowVisionStyle = (settings: LowVisionSettings | null) =>
  settings ? (lowVisionVariables(settings) as CSSProperties) : undefined;

/** Запись cookie на весь сайт: выбор на странице врача сервер увидит и на главной. */
const lowVisionCookie = (settings: LowVisionSettings | null) =>
  settings
    ? `${LOW_VISION_COOKIE}=${encodeURIComponent(serializeLowVision(settings))}; path=/; max-age=${LOW_VISION_MAX_AGE}; samesite=lax`
    : `${LOW_VISION_COOKIE}=; path=/; max-age=0; samesite=lax`;

/** Ставит режим на открытую страницу: атрибуты и переменные цветов `<html>`, cookie; `null` — снимает. */
export const applyLowVision = (settings: LowVisionSettings | null) => {
  const html = document.documentElement;

  for (const name of LOW_VISION_ATTRIBUTES) {
    html.removeAttribute(name);
  }

  for (const name of LOW_VISION_VARIABLES) {
    html.style.removeProperty(name);
  }

  for (const [name, value] of Object.entries(lowVisionAttributes(settings))) {
    html.setAttribute(name, value);
  }

  for (const [name, value] of Object.entries(lowVisionVariables(settings))) {
    html.style.setProperty(name, value);
  }

  document.cookie = lowVisionCookie(settings);
};
