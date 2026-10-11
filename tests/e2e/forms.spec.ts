import { expect, test } from '@playwright/test';
import { appUrl, SINK_URL, type E2EApp } from './consts';

type SinkCall = { channel: string; path: string; body: { text?: string } };

/** Смоук формы заявки: демо с `LeadForm` входит сюда строкой, своего спека не получает (D37). */
const FORM_APPS: { slug: E2EApp['slug']; path: string }[] = [{ slug: 'dental', path: '/' }];

test.describe('смоук формы заявки', () => {
  for (const { slug, path } of FORM_APPS) {
    test(`«${slug}»: заявка с формы доходит до бота с пометкой демо`, async ({ page, request }) => {
      const name = `e2e-${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      await page.goto(`${appUrl(slug)}${path}`);
      await page.getByLabel('Имя').fill(name);
      await page.getByLabel('Телефон или ник в Telegram').fill('+7 900 000-00-00');
      await page.getByLabel('Комментарий').fill('Проверка формы');
      await page.getByLabel(/Соглашаюсь на\sобработку/).check();
      await page.getByRole('button', { name: 'Отправить заявку' }).click();

      await expect(page.getByRole('status')).toContainText('Заявка отправлена');

      const calls = (await (await request.get(`${SINK_URL}/calls`)).json()) as SinkCall[];
      const messages = calls.filter(
        (call) => call.channel === 'telegram' && call.path.endsWith('/sendMessage') && call.body.text?.includes(name),
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].body.text).toContain(`demo=${slug}`);
    });
  }
});
