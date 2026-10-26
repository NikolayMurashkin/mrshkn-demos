import type { DemoLang, LowVisionColors, LowVisionScheme, LowVisionSettings } from './types';

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
  ru: { autoComplete: 'tel', spellCheck: false },
  en: { autoComplete: 'on', spellCheck: false },
};

export const LEAD_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

/** Анкета оценки качества: столько же, сколько заявок, — политика обещает хранить адрес около 10 минут. */
export const SURVEY_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

/** Как часто лимитер стирает адреса, которые не обращались дольше окна: память не держит их до перезапуска. */
export const RATE_LIMIT_SWEEP_MS = 60 * 1000;

export const SURVEY_ENDPOINT = '/api/survey';

/** Оценка анкеты — целое по шкале от 1 до 5. */
export const SURVEY_RATING_MIN = 1;

export const SURVEY_RATING_MAX = 5;

/** Поиск по сайту: длинный запрос обрезается, чтобы не гонять в базу текст на страницу. */
export const SEARCH_QUERY_MAX_LENGTH = 100;

/** Версия для слабовидящих: выбор хранится в cookie год, сервер рисует страницу сразу в нем. */
export const LOW_VISION_COOKIE = 'low_vision';

export const LOW_VISION_MAX_AGE = 60 * 60 * 24 * 365;

/** Что включает значок «Версия для слабовидящих». */
export const LOW_VISION_DEFAULTS: LowVisionSettings = { font: '150', scheme: 'black-on-white', images: 'on' };

/**
 * Цвета схем версии для слабовидящих — единственный источник: в CSS они приходят переменными `--lv-*` на `<html>`.
 * Текст и акцент к фону — не ниже 7:1 (ГОСТ Р 52872-2019, 1.4.6).
 */
export const LOW_VISION_SCHEMES: Record<LowVisionScheme, LowVisionColors> = {
  'black-on-white': { text: '#000000', background: '#ffffff', accent: '#1a3ee8' },
  'white-on-black': { text: '#ffffff', background: '#000000', accent: '#ffdd00' },
  'blue-on-lightblue': { text: '#063462', background: '#9dd1ff', accent: '#3b0a6e' },
};

/** Событие, которым значок в шапке включает режим в панели без перезагрузки страницы. */
export const LOW_VISION_EVENT = 'low-vision-change';

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
