import { defineConfig, devices } from '@playwright/test';
import {
  BASE_URL,
  databaseUrl,
  E2E_APPS,
  E2E_DATABASE_URL,
  SINK_URL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_IDS,
  YOOKASSA_SECRET_KEY,
  YOOKASSA_SHOP_ID,
} from './tests/e2e/consts';

/** Шаблон проверяется без Telegram — заявка только сохраняется; остальные демо шлют уведомления в приемник. */
const NOTIFY_ENV = {
  TELEGRAM_API_URL: SINK_URL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_IDS,
  YOOKASSA_API_URL: SINK_URL,
  YOOKASSA_SHOP_ID,
  YOOKASSA_SECRET_KEY,
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node tests/e2e/sink.ts',
      url: `${SINK_URL}/calls`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
    },
    ...E2E_APPS.map(({ slug, port, database }) => ({
      // база создается, если ее нет; схему ведут миграции, как на стенде
      command: `node tests/e2e/create-database.ts && yarn workspace @mrshkn/demo-${slug} build && yarn workspace @mrshkn/demo-${slug} start -p ${port}`,
      env: {
        DATABASE_URL: slug === 'template' ? E2E_DATABASE_URL : databaseUrl(database),
        PAYLOAD_SECRET: 'e2e',
        MIGRATE_ON_START: 'true',
        ...(slug === 'template' ? {} : NOTIFY_ENV),
      },
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      // сборки трех демо идут на одной машине: запас на каждую
      timeout: 900_000,
      stdout: 'pipe' as const,
    })),
  ],
});
