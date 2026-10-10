import type { DemoLang } from './types';

export const STUDIO_NAME = 'MRSHKN';

export const STUDIO_URL = 'https://mrshkn.com';

export const STUDIO_EMAIL = 'hello@mrshkn.com';

/** Демо живут одноуровневыми поддоменами: wildcard-сертификат `*.mrshkn.com` покрывает ровно один уровень,
 * а сертификат на конкретное имя попал бы в открытый журнал Certificate Transparency. */
export const DEMO_DOMAIN = 'mrshkn.com';

/** Имя поддомена: латиница в нижнем регистре, цифры и дефис, с буквы, до 30 знаков. */
export const DEMO_SLUG_PATTERN = /^[a-z][a-z0-9-]{1,29}$/;

/** Поддомены, которые заняты студией или ее проектами, и сам шаблон. */
export const RESERVED_SLUGS = ['template', 'www', 'stage', 'coolify', 'hello', 'mail', 'api', 'admin', 'kaup39'];

/** Демо открыто поиску только в этом окружении; любое другое значение и пустое — noindex. */
export const DEMO_ENV_PRODUCTION = 'production';

export const NOINDEX_ROBOTS_TAG = 'noindex, nofollow';

export const POLICY_HREF = '/privacy';

export const LEAD_FORM_ID = 'lead-form';

export const LEAD_ENDPOINT = '/api/lead';

export const CONSENT_COOKIE = 'cookie_notice';

export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Поле-приманка: человек его не видит, бот заполняет. Имя вне словаря автозаполнения, иначе браузер
 * подставил бы туда данные живому человеку, и его заявка молча пропала бы.
 */
export const HONEYPOT_FIELD = 'zone';

export const NAME_MAX_LENGTH = 120;

export const CONTACT_MAX_LENGTH = 120;

export const COMMENT_MAX_LENGTH = 2000;

/** Поле связи по языку: на русском — телефон или ник в Telegram, на английском — телефон или почта, без «tel». */
export const CONTACT_INPUT: Record<DemoLang, { autoComplete: string; spellCheck?: boolean }> = {
  ru: { autoComplete: 'tel' },
  en: { autoComplete: 'on', spellCheck: false },
};

export const LEAD_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

/** Сколько адресов помнит лимитер, прежде чем выбросить протухшие. */
export const RATE_LIMIT_MAX_KEYS = 1000;

export const TELEGRAM_API_FALLBACK = 'https://api.telegram.org';

export const YANDEX_ORG_ID_PATTERN = /^\d+$/;

/**
 * Подпись вымышленного отзыва: имя и первая буква фамилии — кириллицей на русском («Ирина С.», «Анна-Мария К.»),
 * латиницей на английском («Emily R.», «Mary-Jane K.»).
 */
export const REVIEW_AUTHOR_PATTERNS: Record<DemoLang, RegExp> = {
  ru: /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)? [А-ЯЁ]\.$/,
  en: /^[A-Z][a-z]+(?:-[A-Z][a-z]+)? [A-Z]\.$/,
};

/** Подсказка редактору, когда подпись не прошла проверку: админка на русском, пример — на языке отзыва. */
export const REVIEW_AUTHOR_HINTS: Record<DemoLang, string> = {
  ru: 'Имя и первая буква фамилии кириллицей: «Ирина С.»',
  en: 'Имя и первая буква фамилии латиницей: «Emily R.»',
};

/** Виджет Яндекс Карт без ключа API: встает iframe'ом и сам грузит все, что ему нужно. */
export const MAP_WIDGET_URL = 'https://yandex.ru/map-widget/v1/';

/** Масштаб, на котором видны улица и соседние кварталы. */
export const MAP_ZOOM = 16;

export const NBSP = '\u00a0';

/** Короткие предлоги, союзы и частицы: после них типограф ставит неразрывный пробел. */
export const SHORT_WORDS = [
  'а',
  'в',
  'во',
  'и',
  'к',
  'ко',
  'о',
  'об',
  'от',
  'по',
  'с',
  'со',
  'у',
  'за',
  'из',
  'на',
  'не',
  'ни',
  'но',
  'до',
  'для',
  'без',
  'при',
  'про',
  'под',
  'над',
];
