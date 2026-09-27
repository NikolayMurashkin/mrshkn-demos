import config from '@payload-config';
import { HONEYPOT_FIELD } from '@mrshkn/demo-core/consts';
import { createLeadRoute } from '@mrshkn/demo-core/lead-route';
import { getPayload, type Payload } from 'payload';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO } from '@/demo.config';
import { startTelegramSink } from './telegram-sink';

let payload: Payload;
let sink: Awaited<ReturnType<typeof startTelegramSink>>;
let address = 0;

const VALID = { name: 'Анна', contact: '@anna', comment: 'Хочу записаться', consent: true };

/** Каждый запрос — со своего адреса: лимит частоты живет в обработчике и не должен мешать соседним тестам. */
const post = (route: ReturnType<typeof createLeadRoute>, body: unknown, headers: Record<string, string> = {}) =>
  route(
    new Request('http://localhost/api/lead', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        referer: 'http://localhost/uslugi',
        'x-forwarded-for': `10.0.0.${++address}`,
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );

const leadsNamed = async (name: string) =>
  (await payload.find({ collection: 'leads', where: { name: { equals: name } } })).docs;

beforeAll(async () => {
  payload = await getPayload({ config });
  sink = await startTelegramSink();
});

afterAll(async () => {
  await sink.close();
  await payload.destroy();
});

beforeEach(() => {
  process.env.TELEGRAM_API_URL = sink.url;
  process.env.TELEGRAM_BOT_TOKEN = 'sink-token';
  process.env.TELEGRAM_CHAT_IDS = '100100,200200';
  sink.calls.length = 0;
  sink.failWith(200);
});

afterEach(() => {
  delete process.env.TELEGRAM_API_URL;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_IDS;
  vi.restoreAllMocks();
});

describe('заявка с формы демо', () => {
  it('сохраняется в CMS демо с пометкой демо и страницы', async () => {
    const route = createLeadRoute({ config, demo: DEMO });
    const response = await post(route, { ...VALID, name: 'Анна-сохранение' });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await leadsNamed('Анна-сохранение')).toEqual([
      expect.objectContaining({ contact: '@anna', comment: 'Хочу записаться', demo: 'template', page: '/uslugi' }),
    ]);
  });

  it('приходит в Telegram каждому чату', async () => {
    const route = createLeadRoute({ config, demo: DEMO });

    await post(route, { ...VALID, name: 'Анна-телеграм' });

    expect(sink.calls.map((call) => call.path)).toEqual(['/botsink-token/sendMessage', '/botsink-token/sendMessage']);
    expect(sink.calls.map((call) => call.body.chat_id).sort()).toEqual(['100100', '200200']);
    expect(sink.calls[0].body.text).toContain('Анна-телеграм');
    expect(sink.calls[0].body.text).toContain('demo=template');
  });

  it('без бота только сохраняется', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    const route = createLeadRoute({ config, demo: DEMO });
    const response = await post(route, { ...VALID, name: 'Анна-без-бота' });

    expect(response.status).toBe(200);
    expect(sink.calls).toEqual([]);
    expect(await leadsNamed('Анна-без-бота')).toHaveLength(1);
  });

  it('упавший Telegram не теряет заявку', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sink.failWith(502);

    const route = createLeadRoute({ config, demo: DEMO });
    const response = await post(route, { ...VALID, name: 'Анна-телеграм-упал' });

    expect(response.status).toBe(200);
    expect(await leadsNamed('Анна-телеграм-упал')).toHaveLength(1);
    expect(console.error).toHaveBeenCalled();
  });

  it('без согласия на обработку данных отклоняется и не сохраняется', async () => {
    const route = createLeadRoute({ config, demo: DEMO });
    const response = await post(route, { ...VALID, name: 'Анна-без-согласия', consent: false });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ ok: false, reason: 'consent' });
    expect(await leadsNamed('Анна-без-согласия')).toEqual([]);
  });

  it('бот с заполненной приманкой получает «ок», но заявки нет', async () => {
    const route = createLeadRoute({ config, demo: DEMO });
    const response = await post(route, { ...VALID, name: 'Бот-приманка', [HONEYPOT_FIELD]: 'x' });

    expect(response.status).toBe(200);
    expect(await leadsNamed('Бот-приманка')).toEqual([]);
    expect(sink.calls).toEqual([]);
  });

  it('с одного адреса больше десяти заявок за десять минут не принимается', async () => {
    const route = createLeadRoute({ config, demo: DEMO });
    const statuses = [];

    for (let index = 0; index < 11; index += 1) {
      statuses.push((await post(route, { ...VALID, name: 'Анна-лимит' }, { 'x-forwarded-for': '203.0.113.7' })).status);
    }

    expect(statuses.slice(0, 10).every((status) => status === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
    expect(await leadsNamed('Анна-лимит')).toHaveLength(10);
  });

  it('аноним заявки не видит', async () => {
    await expect(payload.find({ collection: 'leads', overrideAccess: false })).rejects.toThrow();
  });

  it('редактор CMS заявки читает, но не создает и не правит: их пишет только форма', async () => {
    const editor = await payload.create({
      collection: 'users',
      data: { email: `editor-${Date.now()}@example.com`, password: 'integration-password' },
    });
    const [lead] = await leadsNamed('Анна-сохранение');

    expect(
      (await payload.find({ collection: 'leads', overrideAccess: false, user: editor })).totalDocs,
    ).toBeGreaterThan(0);
    await expect(
      payload.create({
        collection: 'leads',
        data: { name: 'Чужая', contact: 'x', demo: 'template' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow();
    await expect(
      payload.update({
        collection: 'leads',
        id: lead.id,
        data: { name: 'Подмена' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow();
  });
});
