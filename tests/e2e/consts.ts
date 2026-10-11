export const PORT = 3301;

export const BASE_URL = `http://localhost:${PORT}`;

/** Playwright `.env` не читает: адрес e2e-базы задается окружением, по умолчанию — `demos_e2e` в контейнере разработки. */
export const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL ?? 'postgres://demos:demos@127.0.0.1:5435/demos_e2e';

/**
 * Приложения, которые поднимает e2e: у каждого свой порт и своя база на том же сервере Postgres, что и `demos_e2e`.
 * Шаблон проверяет `template.spec.ts`, «Клиника» — смоук форм, «Эксперт» — смоук записи с оплатой.
 */
export const E2E_APPS = [
  { slug: 'template', port: PORT, database: 'demos_e2e' },
  { slug: 'dental', port: 3308, database: 'demos_dental_e2e' },
  { slug: 'expert', port: 3309, database: 'demos_expert_e2e' },
] as const;

export type E2EApp = (typeof E2E_APPS)[number];

/** Приемник вместо Telegram и ЮKassa: запоминает вызовы, отдает страницу оплаты. */
export const SINK_PORT = 3313;

export const SINK_URL = `http://127.0.0.1:${SINK_PORT}`;

export const TELEGRAM_BOT_TOKEN = 'e2e-token';

export const TELEGRAM_CHAT_IDS = '100100';

export const YOOKASSA_SHOP_ID = '100500';

export const YOOKASSA_SECRET_KEY = 'e2e_sink_secret';

export const appUrl = (slug: E2EApp['slug']) =>
  `http://localhost:${E2E_APPS.find((app) => app.slug === slug)?.port ?? PORT}`;

/** Адрес базы приложения: сервер и учетная запись из `E2E_DATABASE_URL`, имя базы — свое. */
export const databaseUrl = (database: string) => {
  const url = new URL(E2E_DATABASE_URL);

  url.pathname = `/${database}`;

  return url.toString();
};

export const appDatabaseUrl = (slug: E2EApp['slug']) =>
  databaseUrl(E2E_APPS.find((app) => app.slug === slug)?.database ?? 'demos_e2e');
