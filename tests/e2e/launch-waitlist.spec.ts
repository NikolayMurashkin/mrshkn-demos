import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { appDatabaseUrl, appUrl } from './consts';

const LAUNCH_URL = appUrl('launch');

test.describe('«SaaS-лендинг»: список ожидания', () => {
  test('адрес с согласием из формы в плите попадает в список ожидания', async ({ page }) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

    await page.goto(`${LAUNCH_URL}/`);

    const waitlist = page.locator('#waitlist');

    await waitlist.getByLabel('Рабочая почта').fill(email);
    await waitlist.getByLabel(/Соглашаюсь на\sобработку/).check();
    await waitlist.getByRole('button', { name: 'Встать в очередь' }).click();

    await expect(waitlist.getByRole('status')).toContainText('Вы в списке ожидания');

    const client = new Client({ connectionString: appDatabaseUrl('launch') });

    await client.connect();

    const { rows } = await client.query('select email from waitlist where email = $1', [email]);

    await client.end();

    expect(rows).toEqual([{ email }]);
  });
});
