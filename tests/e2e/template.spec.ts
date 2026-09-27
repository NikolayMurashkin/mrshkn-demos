import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { E2E_DATABASE_URL } from './consts';

const STUDIO_URL = 'https://mrshkn.com';

test.describe('шаблон демо', () => {
  test('подвал подписан «Демо-проект студии MRSHKN» и ведет на mrshkn.com', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');

    await expect(footer).toContainText('Демо-проект студии MRSHKN');
    await expect(footer.getByRole('link', { name: 'студии MRSHKN' })).toHaveAttribute('href', STUDIO_URL);
  });

  test('ни одна ссылка страницы не ведет в 404, у каждого якоря есть цель', async ({ page, request }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));

    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of new Set(hrefs)) {
      expect(href, 'пустая ссылка').not.toBe('#');

      if (href.startsWith('#')) {
        await expect(page.locator(href), href).toHaveCount(1);
      } else if (href.startsWith('/')) {
        expect((await request.get(href)).status(), href).toBe(200);
      }
    }
  });

  test('разметка schema.org описывает дело демо и его поддомен', async ({ page }) => {
    await page.goto('/');

    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '');

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      url: 'https://template.mrshkn.com',
    });
  });

  test('уведомление о cookie закрывается и не возвращается после перезагрузки', async ({ page }) => {
    await page.goto('/');

    const notice = page.getByRole('region', { name: 'Уведомление о cookie' });

    await expect(notice).toBeVisible();
    await notice.getByRole('button', { name: 'Понятно' }).click();
    await expect(notice).toHaveCount(0);

    await page.reload();

    await expect(page.locator('footer')).toBeVisible();
    await expect(notice).toHaveCount(0);
  });

  test('закрытое уведомление о cookie сервер не отдает вовсе — оно не мелькает до гидрации', async ({ request }) => {
    const fresh = await (await request.get('/')).text();
    const returning = await (await request.get('/', { headers: { cookie: 'cookie_notice=1' } })).text();

    expect(fresh).toContain('Уведомление о cookie');
    expect(returning).not.toContain('Уведомление о cookie');
  });

  test('без Mini App кнопка записи ведет к форме заявки', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Записаться' }).click();

    await expect(page).toHaveURL(/#lead-form$/);
    await expect(page.getByRole('button', { name: 'Отправить заявку' })).toBeInViewport();
  });

  test('заявка с формы сохраняется в CMS демо', async ({ page }) => {
    const name = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await page.goto('/');
    await page.getByLabel('Имя').fill(name);
    await page.getByLabel('Телефон или ник в Telegram').fill('+7 900 000-00-00');
    await page.getByLabel('Комментарий').fill('Проверка формы');
    await page.getByLabel(/Соглашаюсь на\sобработку/).check();
    await page.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(page.getByRole('status')).toContainText('Заявка отправлена');

    const client = new Client({ connectionString: E2E_DATABASE_URL });

    await client.connect();

    const { rows } = await client.query('select contact, comment, demo, page from leads where name = $1', [name]);

    await client.end();

    expect(rows).toEqual([{ contact: '+7 900 000-00-00', comment: 'Проверка формы', demo: 'template', page: '/' }]);
  });

  test('вне production демо закрыто от поиска: заголовок, meta и robots.txt', async ({ page, request }) => {
    const response = await page.goto('/');

    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
  });

  test('политика обработки данных открывается', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Политика обработки персональных данных');
    await expect(page.locator('footer')).toContainText('Демо-проект студии MRSHKN');
  });

  test('подсказки темы админки не приходят на страницы демо: Critical-CH заставил бы Chrome повторить первый запрос', async ({
    request,
  }) => {
    for (const path of ['/', '/privacy']) {
      const headers = (await request.get(path)).headers();

      expect(headers['critical-ch'], path).toBeUndefined();
      expect(headers['accept-ch'], path).toBeUndefined();
    }

    expect((await request.get('/admin')).headers()['accept-ch']).toBe('Sec-CH-Prefers-Color-Scheme');
  });

  test('панель управления CMS отвечает', async ({ request }) => {
    expect((await request.get('/admin')).status()).toBe(200);
  });

  test('на телефоне страница не шире экрана', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBe(0);
  });
});
