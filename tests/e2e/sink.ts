import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { appUrl, SINK_PORT, SINK_URL } from './consts.ts';

type SinkCall = {
  channel: 'telegram' | 'yookassa';
  method: string;
  path: string;
  body: unknown;
};

type Payment = {
  id: string;
  status: 'pending' | 'succeeded';
  paid: boolean;
  amount: { value: string; currency: string };
  description?: string;
  metadata: Record<string, string>;
  confirmation: { type: 'redirect'; confirmation_url: string; return_url: string };
  created_at: string;
  captured_at?: string;
  test: true;
};

const calls: SinkCall[] = [];

const payments = new Map<string, Payment>();

const TELEGRAM_PATH = /^\/bot[^/]+\/sendMessage$/;

const PAYMENT_PATH = /^\/v3\/payments\/([^/]+)$/;

const PAY_PATH = /^\/pay\/([^/]+)$/;

/** Уведомления об оплате приемник шлет «Эксперту»: смоук записи с оплатой есть только у него. */
const WEBHOOK_URL = `${appUrl('expert')}/api/yookassa`;

const readBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
};

const parse = (raw: string) => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
};

const sendJson = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};

const payPage = (payment: Payment) => `<!doctype html>
<html lang="ru">
  <head><meta charset="utf-8"><title>Оплата — заглушка ЮKassa</title></head>
  <body>
    <h1>Оплата ${payment.amount.value} ${payment.amount.currency}</h1>
    <form method="post" action="/pay/${payment.id}"><button type="submit">Оплатить</button></form>
  </body>
</html>`;

/**
 * Приемник e2e по образцу `site/tests/e2e/lead-sink.ts`: Telegram (`POST /bot<token>/sendMessage`), API ЮKassa
 * (`POST /v3/payments`, `GET /v3/payments/:id`), страница оплаты `/pay/<id>`: «Оплатить» помечает платеж оплаченным,
 * шлет приложению уведомление `payment.succeeded` и возвращает на `return_url`. `GET /calls` — что пришло.
 */
const handle = async (request: IncomingMessage, response: ServerResponse) => {
  const url = new URL(request.url ?? '/', SINK_URL);
  const method = request.method ?? 'GET';

  if (method === 'GET' && url.pathname === '/calls') {
    sendJson(response, 200, calls);

    return;
  }

  if (method === 'DELETE' && url.pathname === '/calls') {
    calls.length = 0;
    response.writeHead(204).end();

    return;
  }

  if (method === 'POST' && TELEGRAM_PATH.test(url.pathname)) {
    calls.push({ channel: 'telegram', method, path: url.pathname, body: parse(await readBody(request)) });
    sendJson(response, 200, { ok: true, result: { message_id: calls.length } });

    return;
  }

  if (method === 'POST' && url.pathname === '/v3/payments') {
    const body = parse(await readBody(request)) as {
      amount: Payment['amount'];
      description?: string;
      metadata?: Record<string, string>;
      confirmation: { return_url: string };
    };
    const id = randomUUID();
    const payment: Payment = {
      id,
      status: 'pending',
      paid: false,
      amount: body.amount,
      description: body.description,
      metadata: body.metadata ?? {},
      confirmation: {
        type: 'redirect',
        confirmation_url: `${SINK_URL}/pay/${id}`,
        return_url: body.confirmation.return_url,
      },
      created_at: new Date().toISOString(),
      test: true,
    };

    calls.push({ channel: 'yookassa', method, path: url.pathname, body });
    payments.set(id, payment);
    sendJson(response, 200, payment);

    return;
  }

  const paymentMatch = PAYMENT_PATH.exec(url.pathname);

  if (method === 'GET' && paymentMatch) {
    const payment = payments.get(paymentMatch[1]);

    calls.push({ channel: 'yookassa', method, path: url.pathname, body: null });

    if (payment) {
      sendJson(response, 200, payment);
    } else {
      sendJson(response, 404, { type: 'error', code: 'not_found', description: 'Payment not found' });
    }

    return;
  }

  const payMatch = PAY_PATH.exec(url.pathname);
  const payment = payMatch ? payments.get(payMatch[1]) : undefined;

  if (method === 'GET' && payment) {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(payPage(payment));

    return;
  }

  if (method === 'POST' && payment) {
    payment.status = 'succeeded';
    payment.paid = true;
    payment.captured_at = new Date().toISOString();

    const status = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'notification', event: 'payment.succeeded', object: payment }),
    }).then(
      (notified) => String(notified.status),
      (error: unknown) => (error instanceof Error ? error.message : String(error)),
    );

    if (status !== '200') {
      response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(`Приложение не приняло уведомление: ${status}`);

      return;
    }

    response.writeHead(303, { location: payment.confirmation.return_url });
    response.end();

    return;
  }

  response.writeHead(404);
  response.end();
};

/** Кривой запрос не роняет приемник: остальные тесты прогона продолжают в него писать. */
const server = createServer((request, response) => {
  handle(request, response).catch((error: unknown) => {
    sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
  });
});

server.listen(SINK_PORT, '127.0.0.1');
