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

export const LEAD_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

/** Сколько адресов помнит лимитер, прежде чем выбросить протухшие. */
export const RATE_LIMIT_MAX_KEYS = 1000;

export const TELEGRAM_API_FALLBACK = 'https://api.telegram.org';

export const YANDEX_ORG_ID_PATTERN = /^\d+$/;
