import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { appDatabaseUrl, appUrl, SINK_URL } from './consts';

type SinkCall = { channel: string; path: string; body: { text?: string } };

const EXPERT_URL = appUrl('expert');

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('«Эксперт»: запись с оплатой', () => {
  test('запись на индивидуальную сессию оплачивается через ЮKassa и доходит до бота', async ({ page, request }) => {
    const name = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await page.goto(`${EXPERT_URL}/formats`);
    await page
      .getByRole('link', { name: 'Записаться' })
      .and(page.locator('[href="/booking?format=individual"]'))
      .click();

    await expect(page).toHaveURL(`${EXPERT_URL}/booking?format=individual`);
    await expect(page.getByRole('radio', { name: 'Индивидуальная сессия' })).toBeChecked();

    await page.getByLabel('Имя').fill(name);
    await page.getByLabel('Телефон или ник в Telegram').fill('+7 900 000-00-00');
    await page.getByLabel('Когда удобно').fill('по будням после 18');
    await page.getByLabel(/Соглашаюсь на\sобработку/).check();
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();

    await expect(page).toHaveURL(new RegExp(`^${escapeRegExp(SINK_URL)}/pay/[^/?#]+$`));
    await page.getByRole('button', { name: 'Оплатить' }).click();

    await expect(page).toHaveURL(new RegExp(`^${escapeRegExp(EXPERT_URL)}/booking/paid\\?booking=[^&#]+$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Оплата прошла');

    const client = new Client({ connectionString: appDatabaseUrl('expert') });

    await client.connect();

    const { rows } = await client.query('select id, status from bookings where name = $1', [name]);

    await client.end();

    expect(rows).toEqual([{ id: expect.anything(), status: 'paid' }]);
    expect(page.url()).toBe(`${EXPERT_URL}/booking/paid?booking=${rows[0].id}`);

    const calls = (await (await request.get(`${SINK_URL}/calls`)).json()) as SinkCall[];
    const messages = calls.filter(
      (call) => call.channel === 'telegram' && call.path.endsWith('/sendMessage') && call.body.text?.includes(name),
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].body.text).toContain('demo=expert');
  });
});
