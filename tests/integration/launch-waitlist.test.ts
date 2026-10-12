import type {} from '@payloadcms/db-postgres';
import { HONEYPOT_FIELD, LEAD_RATE_LIMIT } from '@mrshkn/demo-core/consts';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, ValidationError, type CollectionSlug, type Payload, type SanitizedConfig } from 'payload';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import resetTestDatabase from './setup';

type Route = (request: Request) => Promise<Response>;

type RouteFactory = (options: { config: Promise<SanitizedConfig> }) => Route;

type Entry = { id: number | string; email: string; createdAt: string };

const LAUNCH_SRC = path.resolve(import.meta.dirname, '../../apps/launch/src');

/** Модуль демо «SaaS-лендинг»: пока его нет, тест падает на assert, а не на сборке файла. */
const importLaunch = async <T>(relative: string): Promise<T> => {
  const file = path.join(LAUNCH_SRC, relative);

  expect(existsSync(file), `нет apps/launch/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

/** Схема демо в базе тестов неизвестна: коллекция берется по имени из контракта, без сгенерированных типов. */
const WAITLIST = 'waitlist' as CollectionSlug;

let config: Promise<SanitizedConfig>;
let route: Route;
let payload: Payload;
let address = 0;

/** Каждый запрос — со своего адреса: лимит частоты живет в обработчике и не должен мешать соседним тестам. */
const post = (body: unknown, forwardedFor = `10.0.2.${++address}`) =>
  route(
    new Request('http://localhost/api/waitlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': forwardedFor },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

/** Адреса пишутся в коллекцию waitlist демо: без нее тест падает на assert, а не на ошибке Payload. */
const expectWaitlistCollection = () => expect(payload.collections[WAITLIST], 'нет коллекции waitlist').toBeDefined();

const entriesWith = async (email: string) => {
  expectWaitlistCollection();

  return (await payload.find({ collection: WAITLIST, where: { email: { equals: email } }, depth: 0 }))
    .docs as unknown as Entry[];
};

/** Адрес в списке, записанный в обход обработчика — как его оставил бы прежний запрос. */
const entriesWithCreated = async (email: string) => {
  expectWaitlistCollection();
  await payload.create({ collection: WAITLIST, data: { email } });

  return entriesWith(email);
};

const entriesCount = async () => {
  expectWaitlistCollection();

  return (await payload.count({ collection: WAITLIST })).totalDocs;
};

/**
 * У шаблона и демо разные схемы, а база интеграционных тестов одна: файл начинает и заканчивает на пустой
 * схеме, чтобы Payload соседнего файла не спрашивал в терминале о потере данных.
 */
beforeAll(async () => {
  ({ default: config } = await importLaunch<{ default: Promise<SanitizedConfig> }>('payload.config.ts'));

  const { createWaitlistRoute } = await importLaunch<{ createWaitlistRoute: RouteFactory }>('waitlist/route.ts');

  /** Один обработчик на файл, как модуль страницы: лимитер у него один на все запросы. */
  route = createWaitlistRoute({ config });

  await resetTestDatabase();
  payload = await getPayload({ config, key: 'launch' });
});

afterAll(async () => {
  await payload?.destroy();
  await resetTestDatabase();
});

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('заявка в список ожидания', () => {
  it('W1: адрес с согласием — 200 и одна запись в коллекции waitlist', async () => {
    const response = await post({ email: 'w1@example.com', consent: true });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    const entries = await entriesWith('w1@example.com');

    expect(entries).toHaveLength(1);
    expect(entries[0].email).toBe('w1@example.com');
  });

  it('W2: повтор того же адреса — 200, запись одна, ее id и дата создания прежние', async () => {
    const first = await post({ email: 'w2@example.com', consent: true });

    expect(first.status).toBe(200);

    const [before] = await entriesWith('w2@example.com');

    expect(before).toBeDefined();

    const second = await post({ email: 'w2@example.com', consent: true });

    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: true });

    const after = await entriesWith('w2@example.com');

    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(before.id);
    expect(after[0].createdAt).toBe(before.createdAt);
  });

  it('W3: повтор в другом регистре и с пробелами — 200, запись одна, адрес в нижнем регистре', async () => {
    expect((await post({ email: 'w3@example.com', consent: true })).status).toBe(200);

    const response = await post({ email: '  W3@Example.com ', consent: true });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    const entries = await entriesWith('w3@example.com');

    expect(entries).toHaveLength(1);
    expect(entries[0].email).toBe('w3@example.com');
    expect(await entriesWith('W3@Example.com')).toEqual([]);
  });

  it('W4: два одновременных запроса с одним новым адресом — оба 200, запись одна', async () => {
    const responses = await Promise.all([
      post({ email: 'w4@example.com', consent: true }),
      post({ email: 'w4@example.com', consent: true }),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(await Promise.all(responses.map((response) => response.json()))).toEqual([{ ok: true }, { ok: true }]);
    expect(await entriesWith('w4@example.com')).toHaveLength(1);
  });

  it('W5: без согласия — 422 «consent», записи нет', async () => {
    const response = await post({ email: 'w5@example.com', consent: false });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ ok: false, reason: 'consent' });
    expect(await entriesWith('w5@example.com')).toEqual([]);
  });

  it('W6: неверная почта при согласии — 422 «email», записи нет', async () => {
    const response = await post({ email: 'not-an-email', consent: true });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ ok: false, reason: 'email' });
    expect(await entriesWith('not-an-email')).toEqual([]);
  });

  it('W7: тело не JSON — 422, записей не прибавилось', async () => {
    const before = await entriesCount();
    const response = await post('email=w7@example.com&consent=true');

    expect(response.status).toBe(422);
    expect(await entriesCount()).toBe(before);
  });

  it('W8: заполненная приманка — 200 «ок», записи нет', async () => {
    const response = await post({ email: 'w8@example.com', consent: true, [HONEYPOT_FIELD]: 'x' });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await entriesWith('w8@example.com')).toEqual([]);
  });

  it('W9: сверх лимита с одного адреса — 429 «rate» без записи, с другого адреса — 200', async () => {
    const from = '203.0.113.9';
    const statuses = [];

    for (let index = 0; index < LEAD_RATE_LIMIT.limit; index += 1) {
      statuses.push((await post({ email: `w9-${index}@example.com`, consent: true }, from)).status);
    }

    expect(statuses).toEqual(Array.from({ length: LEAD_RATE_LIMIT.limit }, () => 200));

    const limited = await post({ email: 'w9-over@example.com', consent: true }, from);

    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ ok: false, reason: 'rate' });
    expect(await entriesWith('w9-over@example.com')).toEqual([]);

    const other = await post({ email: 'w9-other@example.com', consent: true }, '203.0.113.10');

    expect(other.status).toBe(200);
    expect(await entriesWith('w9-other@example.com')).toHaveLength(1);
  });

  it('A1: без входа список не читается и не пополняется через Local API с проверкой прав', async () => {
    await expect(payload.find({ collection: WAITLIST, overrideAccess: false })).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      payload.create({ collection: WAITLIST, data: { email: 'a1@example.com' }, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 });
    expect(await entriesWith('a1@example.com')).toEqual([]);
  });

  it('A2: вошедший читает список, но не создает и не правит адреса через Local API с проверкой прав', async () => {
    const user = await payload.create({
      collection: 'users',
      data: { email: 'a2-editor@example.com', password: 'a2-editor-password' },
    });
    const [entry] = await entriesWithCreated('a2-listed@example.com');

    await expect(payload.find({ collection: WAITLIST, user, overrideAccess: false, depth: 0 })).resolves.toMatchObject({
      totalDocs: expect.any(Number),
    });
    await expect(
      payload.create({ collection: WAITLIST, data: { email: 'a2-new@example.com' }, user, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      payload.update({
        collection: WAITLIST,
        id: entry.id,
        data: { email: 'a2-changed@example.com' },
        user,
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(await entriesWith('a2-new@example.com')).toEqual([]);
    expect(await entriesWith('a2-listed@example.com')).toHaveLength(1);
  });

  it('W10: запись упала не из-за повтора адреса — обработчик не отвечает «ок», адреса в CMS нет', async () => {
    /** Экземпляр Payload обработчика: он берет `getPayload({ config })` без ключа. */
    const routePayload = await getPayload({ config });
    const create = vi.spyOn(routePayload, 'create');

    /** В списке уже есть чужой адрес: «повтор» нельзя признать по одному факту, что список не пуст. */
    expect((await post({ email: 'w10-listed@example.com', consent: true })).status).toBe(200);

    create.mockRejectedValueOnce(
      new ValidationError({ errors: [{ message: 'поле не прошло проверку', path: 'email' }] }),
    );
    await expect(post({ email: 'w10-invalid@example.com', consent: true })).rejects.toBeInstanceOf(ValidationError);

    create.mockRejectedValueOnce(new Error('база недоступна'));
    await expect(post({ email: 'w10-down@example.com', consent: true })).rejects.toThrow('база недоступна');

    expect(await entriesWith('w10-invalid@example.com')).toEqual([]);
    expect(await entriesWith('w10-down@example.com')).toEqual([]);
  });
});
