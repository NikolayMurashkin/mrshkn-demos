import { randomUUID } from 'node:crypto';
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

export type YookassaAmount = { value: string; currency: string };

export type YookassaPayment = {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid: boolean;
  amount: YookassaAmount;
  metadata: Record<string, string>;
  description?: string;
  confirmation?: { type: 'redirect'; confirmation_url: string; return_url?: string };
  created_at: string;
  test: boolean;
};

export type YookassaCall = {
  method: string;
  path: string;
  headers: IncomingHttpHeaders;
  body: unknown;
  /** Что приемник ответил: платеж или ошибка API. */
  response: unknown;
};

const PAYMENT_PATH = /^\/v3\/payments\/([^/]+)$/;

/**
 * Приемник вместо api.yookassa.ru: `POST /v3/payments` создает платеж `pending` со ссылкой на оплату,
 * `GET /v3/payments/:id` отдает платеж из памяти (неизвестный — 404), все запросы запоминает с заголовками.
 */
export const startYookassaSink = async () => {
  const calls: YookassaCall[] = [];
  const payments = new Map<string, YookassaPayment>();
  let failStatus = 0;
  let url = '';

  const server: Server = createServer((request, response) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
    });
    request.on('end', () => {
      const path = request.url ?? '';
      const body = raw ? JSON.parse(raw) : null;
      const reply = (status: number, payload: unknown) => {
        calls.push({ method: request.method ?? '', path, headers: request.headers, body, response: payload });
        response.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(payload));
      };

      if (failStatus) {
        reply(failStatus, { type: 'error', code: 'internal_server_error', description: 'sink failure' });

        return;
      }

      if (request.method === 'POST' && path === '/v3/payments') {
        const input = (body ?? {}) as {
          amount?: YookassaAmount;
          description?: string;
          metadata?: Record<string, string>;
          confirmation?: { return_url?: string };
        };
        const id = randomUUID();
        const payment: YookassaPayment = {
          id,
          status: 'pending',
          paid: false,
          amount: input.amount ?? { value: '0.00', currency: 'RUB' },
          metadata: input.metadata ?? {},
          description: input.description,
          confirmation: {
            type: 'redirect',
            confirmation_url: `${url}/pay/${id}`,
            return_url: input.confirmation?.return_url,
          },
          created_at: new Date().toISOString(),
          test: true,
        };

        payments.set(id, payment);
        reply(200, payment);

        return;
      }

      const match = PAYMENT_PATH.exec(path);

      if (request.method === 'GET' && match) {
        const payment = payments.get(decodeURIComponent(match[1]));

        if (payment) {
          reply(200, payment);
        } else {
          reply(404, { type: 'error', code: 'not_found', description: 'Payment not found' });
        }

        return;
      }

      reply(404, { type: 'error', code: 'not_found', description: 'Unknown endpoint' });
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    url,
    calls,
    payments,
    /** Платеж, который API отдаст по `GET /v3/payments/:id`: тест задает статус, сумму и метаданные. */
    setPayment(payment: Pick<YookassaPayment, 'id' | 'status' | 'paid' | 'amount' | 'metadata'>) {
      payments.set(payment.id, { created_at: new Date().toISOString(), test: true, ...payment });
    },
    /** Ненулевой код — API отвечает им на любой запрос; 0 — снова работает. */
    failWith(code: number) {
      failStatus = code;
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
