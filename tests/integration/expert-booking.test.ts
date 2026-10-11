import type {} from '@payloadcms/db-postgres';
import { HONEYPOT_FIELD } from '@mrshkn/demo-core/consts';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type CollectionSlug, type Payload, type SanitizedConfig } from 'payload';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import resetTestDatabase from './setup';
import { startTelegramSink } from './telegram-sink';
import { startYookassaSink } from './yookassa-sink';

type Route = (request: Request) => Promise<Response>;

type RouteFactory = (options: { config: Promise<SanitizedConfig> }) => Route;

type Format = { id: number | string; slug: string; title: string; price: number };

type Booking = {
  id: number | string;
  name: string;
  status: 'pending' | 'paid';
  amount: number;
  paymentId?: string | null;
  paidAt?: string | null;
  updatedAt: string;
};

const EXPERT_SRC = path.resolve(import.meta.dirname, '../../apps/expert/src');

/** Модуль демо «Эксперт»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importExpert = async <T>(relative: string): Promise<T> => {
  const file = path.join(EXPERT_SRC, relative);

  expect(existsSync(file), `нет apps/expert/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const NOTIFICATION = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, 'fixtures/yookassa-payment-succeeded.json'), 'utf8'),
) as { type: string; event: string; object: Record<string, unknown> & { metadata: Record<string, string> } };

const SHOP_ID = '100500';
const SECRET_KEY = 'test_sink_secret';
const BASIC_AUTH = `Basic ${Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')}`;
const CHAT_IDS = ['100100', '200200'];

let config: Promise<SanitizedConfig>;
let createBookingRoute: RouteFactory;
let createYookassaWebhookRoute: RouteFactory;
let payload: Payload;
let telegram: Awaited<ReturnType<typeof startTelegramSink>>;
let yookassa: Awaited<ReturnType<typeof startYookassaSink>>;
let individual: Format;
let address = 0;

/** Схема «Эксперта» в базе тестов неизвестна: коллекции берутся по имени из контракта, без сгенерированных типов. */
const BOOKINGS = 'bookings' as CollectionSlug;
const FORMATS = 'formats' as CollectionSlug;

const rubles = (price: number) => `${price}.00`;

/** Текст без неразрывных и прочих пробелов: сумма «4 000 ₽» и «4000» читаются одинаково. */
const compact = (text: string) => text.replace(/[\s  ]/g, '');

const plain = (text: string) => text.replace(/[  ]/g, ' ');

const post = (route: Route, url: string, body: unknown) =>
  route(
    new Request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        referer: 'http://localhost/booking?format=individual',
        'x-forwarded-for': `10.0.1.${++address}`,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const postBooking = (body: unknown) => post(createBookingRoute({ config }), 'http://localhost/api/booking', body);

const postNotification = (route: Route, body: unknown) => post(route, 'http://localhost/api/yookassa', body);

const notification = ({ id, value, bookingId }: { id: string; value: string; bookingId: string }) => {
  const body = structuredClone(NOTIFICATION);

  body.object.id = id;
  body.object.amount = { value, currency: 'RUB' };
  body.object.metadata = { bookingId };

  return body;
};

const bookingById = async (id: Booking['id']) =>
  (await payload.findByID({ collection: BOOKINGS, id, depth: 0 })) as unknown as Booking;

const bookingsNamed = async (name: string) =>
  (await payload.find({ collection: BOOKINGS, where: { name: { equals: name } }, depth: 0 }))
    .docs as unknown as Booking[];

let paymentNumber = 0;

/** Бронь «Индивидуальной сессии», ждущая оплаты, и id ее платежа — как их оставляет обработчик записи. */
const createPendingBooking = async (name: string) => {
  const paymentId = `2f1e0000-000f-5000-9000-${String(++paymentNumber).padStart(12, '0')}`;
  const created = (await payload.create({
    collection: BOOKINGS,
    data: {
      name,
      contact: '@client',
      when: 'по будням после 18',
      comment: 'Первый раз',
      format: individual.id,
      amount: individual.price,
      status: 'pending',
      paymentId,
    },
  })) as unknown as Booking;

  /** Снимок как в базе, без подстановки связей: с ним сравнивается запись после уведомления. */
  return { booking: await bookingById(created.id), paymentId };
};

/** Платеж, который API ЮKassa подтверждает: оплачен, сумма брони, привязан к брони. */
const confirmPayment = (booking: Booking, paymentId: string) =>
  yookassa.setPayment({
    id: paymentId,
    status: 'succeeded',
    paid: true,
    amount: { value: rubles(booking.amount), currency: 'RUB' },
    metadata: { bookingId: String(booking.id) },
  });

const notificationFor = (booking: Booking, paymentId: string) =>
  notification({ id: paymentId, value: rubles(booking.amount), bookingId: String(booking.id) });

const paymentCreations = () => yookassa.calls.filter((call) => call.method === 'POST');

/**
 * У шаблона и «Эксперта» разные схемы, а база интеграционных тестов одна: файл начинает и заканчивает на пустой
 * схеме, чтобы Payload соседнего файла не спрашивал в терминале о потере данных.
 */
beforeAll(async () => {
  ({ default: config } = await importExpert<{ default: Promise<SanitizedConfig> }>('payload.config.ts'));
  ({ createBookingRoute } = await importExpert<{ createBookingRoute: RouteFactory }>('payment/booking-route.ts'));
  ({ createYookassaWebhookRoute } = await importExpert<{ createYookassaWebhookRoute: RouteFactory }>(
    'payment/webhook-route.ts',
  ));

  await resetTestDatabase();
  payload = await getPayload({ config, key: 'expert' });
  telegram = await startTelegramSink();
  yookassa = await startYookassaSink();

  const [format] = (await payload.find({ collection: FORMATS, where: { slug: { equals: 'individual' } }, depth: 0 }))
    .docs as unknown as Format[];

  expect(format, 'засев не создал формат individual').toBeDefined();
  individual = format;
});

afterAll(async () => {
  await telegram?.close();
  await yookassa?.close();
  await payload?.destroy();
  await resetTestDatabase();
});

beforeEach(() => {
  process.env.YOOKASSA_API_URL = yookassa.url;
  process.env.YOOKASSA_SHOP_ID = SHOP_ID;
  process.env.YOOKASSA_SECRET_KEY = SECRET_KEY;
  process.env.TELEGRAM_API_URL = telegram.url;
  process.env.TELEGRAM_BOT_TOKEN = 'sink-token';
  process.env.TELEGRAM_CHAT_IDS = CHAT_IDS.join(',');
  telegram.calls.length = 0;
  telegram.failWith(200);
  yookassa.calls.length = 0;
  yookassa.failWith(0);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  for (const name of [
    'YOOKASSA_API_URL',
    'YOOKASSA_SHOP_ID',
    'YOOKASSA_SECRET_KEY',
    'TELEGRAM_API_URL',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_IDS',
  ]) {
    delete process.env[name];
  }

  vi.restoreAllMocks();
});

describe('уведомление ЮKassa об оплате записи', () => {
  it('W1: подтвержденный API платеж помечает запись оплаченной и сообщает в Telegram', async () => {
    const { booking, paymentId } = await createPendingBooking('Мария-W1');

    confirmPayment(booking, paymentId);

    const response = await postNotification(
      createYookassaWebhookRoute({ config }),
      notificationFor(booking, paymentId),
    );
    const after = await bookingById(booking.id);

    expect(response.status).toBe(200);
    expect(after.status).toBe('paid');
    expect(typeof after.paidAt).toBe('string');
    expect(Date.parse(after.paidAt ?? '')).not.toBeNaN();
    expect(
      yookassa.calls
        .filter((call) => call.method === 'GET')
        .map((call) => ({ path: call.path, authorization: call.headers.authorization })),
    ).toEqual([{ path: `/v3/payments/${paymentId}`, authorization: BASIC_AUTH }]);
    expect(telegram.calls.map((call) => call.path)).toEqual([
      '/botsink-token/sendMessage',
      '/botsink-token/sendMessage',
    ]);
    expect(telegram.calls.map((call) => call.body.chat_id).sort()).toEqual(CHAT_IDS);

    for (const { body } of telegram.calls) {
      expect(body.text).toContain('Мария-W1');
      expect(plain(body.text)).toContain(plain(individual.title));
      expect(compact(body.text)).toContain(String(individual.price));
      expect(body.text).toContain('demo=expert');
    }
  });

  it('W2: платежа нет в магазине (API 404) — 400, запись не меняется, в Telegram пусто', async () => {
    const { booking, paymentId } = await createPendingBooking('Мария-W2');

    const response = await postNotification(
      createYookassaWebhookRoute({ config }),
      notificationFor(booking, paymentId),
    );
    const after = await bookingById(booking.id);

    expect(response.status).toBe(400);
    expect(after.status).toBe('pending');
    expect(after.paidAt ?? null).toBeNull();
    expect(after).toEqual(booking);
    expect(telegram.calls).toEqual([]);
  });

  it('W3: тело говорит succeeded, а API — pending: 400, запись не меняется, в Telegram пусто', async () => {
    const { booking, paymentId } = await createPendingBooking('Мария-W3');

    yookassa.setPayment({
      id: paymentId,
      status: 'pending',
      paid: false,
      amount: { value: rubles(booking.amount), currency: 'RUB' },
      metadata: { bookingId: String(booking.id) },
    });

    const response = await postNotification(
      createYookassaWebhookRoute({ config }),
      notificationFor(booking, paymentId),
    );

    expect(response.status).toBe(400);
    expect(await bookingById(booking.id)).toEqual(booking);
    expect(telegram.calls).toEqual([]);
  });

  it('W4: API подтверждает платеж на другую сумму — 400, запись не меняется', async () => {
    const { booking, paymentId } = await createPendingBooking('Мария-W4');

    yookassa.setPayment({
      id: paymentId,
      status: 'succeeded',
      paid: true,
      amount: { value: '1.00', currency: 'RUB' },
      metadata: { bookingId: String(booking.id) },
    });

    const response = await postNotification(
      createYookassaWebhookRoute({ config }),
      notification({ id: paymentId, value: '1.00', bookingId: String(booking.id) }),
    );

    expect(response.status).toBe(400);
    expect(await bookingById(booking.id)).toEqual(booking);
    expect(telegram.calls).toEqual([]);
  });

  it('W5: платеж привязан к другой записи — 400, обе записи не меняются', async () => {
    const { booking, paymentId } = await createPendingBooking('Мария-W5');
    const { booking: other } = await createPendingBooking('Мария-W5-другая');

    yookassa.setPayment({
      id: paymentId,
      status: 'succeeded',
      paid: true,
      amount: { value: rubles(booking.amount), currency: 'RUB' },
      metadata: { bookingId: String(other.id) },
    });

    const response = await postNotification(
      createYookassaWebhookRoute({ config }),
      notification({ id: paymentId, value: rubles(booking.amount), bookingId: String(other.id) }),
    );

    expect(response.status).toBe(400);
    expect(await bookingById(booking.id)).toEqual(booking);
    expect(await bookingById(other.id)).toEqual(other);
    expect(telegram.calls).toEqual([]);
  });

  it('W6: повторное уведомление по оплаченной записи — 200, запись не меняется, второго сообщения нет', async () => {
    const { booking, paymentId } = await createPendingBooking('Мария-W6');

    confirmPayment(booking, paymentId);

    const route = createYookassaWebhookRoute({ config });
    const first = await postNotification(route, notificationFor(booking, paymentId));
    const paid = await bookingById(booking.id);
    const messages = telegram.calls.length;

    expect(first.status).toBe(200);
    expect(paid.status).toBe('paid');
    expect(messages).toBe(CHAT_IDS.length);

    const again = await postNotification(route, notificationFor(booking, paymentId));
    const after = await bookingById(booking.id);

    expect(again.status).toBe(200);
    expect(after.status).toBe('paid');
    expect(after.paidAt).toBe(paid.paidAt);
    expect(after.updatedAt).toBe(paid.updatedAt);
    expect(telegram.calls).toHaveLength(messages);
  });

  it('W7: не JSON, не payment.succeeded или без object.id — 400 без запроса к API', async () => {
    const route = createYookassaWebhookRoute({ config });
    const known = '2f1e0000-000f-5000-9000-777777777777';

    yookassa.setPayment({
      id: known,
      status: 'succeeded',
      paid: true,
      amount: { value: '2.00', currency: 'RUB' },
      metadata: {},
    });

    const canceled = { ...notification({ id: known, value: '2.00', bookingId: '1' }), event: 'payment.canceled' };
    const withoutId = notification({ id: known, value: '2.00', bookingId: '1' });

    delete withoutId.object.id;

    expect((await postNotification(route, 'not json')).status).toBe(400);
    expect((await postNotification(route, canceled)).status).toBe(400);
    expect((await postNotification(route, withoutId)).status).toBe(400);
    expect(yookassa.calls).toEqual([]);
  });

  it('W8: упавший Telegram не мешает: запись оплачена, ответ 200', async () => {
    telegram.failWith(500);

    const { booking, paymentId } = await createPendingBooking('Мария-W8');

    confirmPayment(booking, paymentId);

    const response = await postNotification(
      createYookassaWebhookRoute({ config }),
      notificationFor(booking, paymentId),
    );

    expect(response.status).toBe(200);
    expect((await bookingById(booking.id)).status).toBe('paid');
  });
});

describe('запись с оплатой', () => {
  const VALID = {
    format: 'individual',
    contact: '@client',
    when: 'в субботу днем',
    comment: 'Хочу разобраться с тревогой',
    consent: true,
  };

  it('B1: запись создает платеж ЮKassa на цену формата из CMS и ведет на оплату', async () => {
    const response = await postBooking({ ...VALID, name: 'Ольга-B1', amount: 1 });

    expect(response.status).toBe(200);

    const bookings = await bookingsNamed('Ольга-B1');
    const creations = paymentCreations();

    expect(bookings).toHaveLength(1);
    expect(creations).toHaveLength(1);

    const [booking] = bookings;
    const [creation] = creations;
    const payment = creation.response as { id: string; confirmation: { confirmation_url: string } };
    const request = creation.body as {
      amount: { value: string; currency: string };
      capture: boolean;
      confirmation: { type: string; return_url: string };
      metadata: Record<string, string>;
    };

    expect(await response.json()).toEqual({ confirmationUrl: payment.confirmation.confirmation_url });
    expect(booking.status).toBe('pending');
    expect(booking.amount).toBe(individual.price);
    expect(booking.paymentId).toBe(payment.id);
    expect(creation.path).toBe('/v3/payments');
    expect(request.amount).toEqual({ value: rubles(individual.price), currency: 'RUB' });
    expect(request.capture).toBe(true);
    expect(request.confirmation.type).toBe('redirect');
    expect(request.confirmation.return_url.endsWith(`/booking/paid?booking=${booking.id}`)).toBe(true);
    expect(String(request.metadata.bookingId)).toBe(String(booking.id));
    expect(String(creation.headers['idempotence-key'] ?? '').trim()).not.toBe('');
    expect(creation.headers.authorization).toBe(BASIC_AUTH);
  });

  it('B2: без согласия — 422, ни записи, ни платежа', async () => {
    const response = await postBooking({ ...VALID, name: 'Ольга-B2', consent: false });

    expect(response.status).toBe(422);
    expect(await bookingsNamed('Ольга-B2')).toEqual([]);
    expect(paymentCreations()).toEqual([]);
  });

  it('B3: заполненная приманка — «ок», но ни записи, ни платежа', async () => {
    const response = await postBooking({ ...VALID, name: 'Бот-B3', [HONEYPOT_FIELD]: 'x' });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await bookingsNamed('Бот-B3')).toEqual([]);
    expect(paymentCreations()).toEqual([]);
  });

  it('B4: неизвестный формат — 422, ни записи, ни платежа', async () => {
    const response = await postBooking({ ...VALID, name: 'Ольга-B4', format: 'nope' });

    expect(response.status).toBe(422);
    expect(await bookingsNamed('Ольга-B4')).toEqual([]);
    expect(paymentCreations()).toEqual([]);
  });

  it('B5: API ЮKassa ответил 500 — 502, висящей записи без платежа не остается', async () => {
    yookassa.failWith(500);

    const response = await postBooking({ ...VALID, name: 'Ольга-B5' });

    expect(response.status).toBe(502);
    expect(await bookingsNamed('Ольга-B5')).toEqual([]);
  });
});
