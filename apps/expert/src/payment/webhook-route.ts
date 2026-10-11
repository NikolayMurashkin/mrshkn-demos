import { getPayload } from 'payload';
import { confirmBookingPayment } from './confirm';
import { YOOKASSA_EVENT_SUCCEEDED } from './consts';
import type { PaymentRouteOptions } from './types';

const json = (body: object, status = 200) => Response.json(body, { status });

/** Id платежа из уведомления `payment.succeeded`; остальное тело не читается — решает ответ API. */
const paymentIdOf = (input: unknown) => {
  const { event, object } = (input ?? {}) as { event?: unknown; object?: { id?: unknown } };
  const id = object?.id;

  return event === YOOKASSA_EVENT_SUCCEEDED && typeof id === 'string' && id ? id : null;
};

/**
 * Уведомление ЮKassa об оплате. Подписи у уведомлений нет, IP-списка у демо нет: подлинность — только ответ API
 * магазина на `GET /v3/payments/{id}`. Повтор по оплаченной записи — 200, иначе ЮKassa повторяла бы его сутки;
 * неподтвержденный платеж — 400; API не ответил — 502, и ЮKassa повторит уведомление позже.
 */
export const createYookassaWebhookRoute = ({ config }: PaymentRouteOptions) => {
  return async (request: Request) => {
    const paymentId = paymentIdOf(await request.json().catch(() => null));

    if (!paymentId) {
      return json({ ok: false, reason: 'notification' }, 400);
    }

    const payload = await getPayload({ config });
    const result = await confirmBookingPayment(payload, paymentId);

    if (result === 'rejected') {
      return json({ ok: false, reason: 'payment' }, 400);
    }

    if (result === 'unavailable') {
      return json({ ok: false, reason: 'api' }, 502);
    }

    return json({ ok: true });
  };
};
