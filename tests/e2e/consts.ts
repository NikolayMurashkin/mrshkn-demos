export const PORT = 3301;

export const BASE_URL = `http://localhost:${PORT}`;

/** Playwright `.env` не читает: адрес e2e-базы задается окружением, по умолчанию — `demos_e2e` в контейнере разработки. */
export const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL ?? 'postgres://demos:demos@127.0.0.1:5435/demos_e2e';
