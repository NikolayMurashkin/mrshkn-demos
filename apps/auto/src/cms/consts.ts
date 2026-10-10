import type { Config } from 'payload';
import { DEFAULT_LANG, LANGS } from '../consts';

/**
 * Языки контента. Без отката на русский: пустое английское поле осталось бы пустым, а не показало бы русский
 * текст на английской странице.
 */
export const LOCALIZATION: Config['localization'] = {
  locales: [...LANGS],
  defaultLocale: DEFAULT_LANG,
  fallback: false,
};
