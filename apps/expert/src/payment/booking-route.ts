import { LEAD_RATE_LIMIT } from '@mrshkn/demo-core/consts';
import { createRateLimiter } from '@mrshkn/demo-core/lead/rate-limit';
import { randomUUID } from 'node:crypto';
import { getPayload } from 'payload';
import { EXPERT } from '../consts';
import { PAID_PATH, PAYMENT_DESCRIPTION_MAX_LENGTH } from './consts';
import { parseBooking } from './parse';
import { addressOf, originOf } from './request';
import type { PaymentRouteOptions } from './types';
import { createPayment } from './yookassa';

const json = (body: object, status = 200) => Response.json(body, { status });

/**
 * Запись с оплатой: запись «ждет оплаты» → платеж ЮKassa на цену формата из CMS → ссылка на оплату. Платеж
 * не создался — запись удаляется, чтобы не висела без платежа, и ответ 502. Лимит и приманка — как у заявки ядра.
 */
export const createBookingRoute = ({ config }: PaymentRouteOptions) => {
  const limiter = createRateLimiter(LEAD_RATE_LIMIT);

  return async (request: Request) => {
    if (!limiter.allow(addressOf(request))) {
      return json({ ok: false, reason: 'rate' }, 429);
    }

    const result = parseBooking(await request.json().catch(() => null));

    if (!result.ok) {
      /** Боту отвечаем так же, как человеку: по ответу нельзя понять, что ловушка сработала. */
      return result.reason === 'honeypot' ? json({ ok: true }) : json({ ok: false, reason: result.reason }, 422);
    }

    const { format: slug, ...fields } = result.booking;
    const payload = await getPayload({ config });
    const {
      docs: [format],
    } = await payload.find({ collection: 'formats', where: { slug: { equals: slug } }, limit: 1, depth: 0 });

    if (!format) {
      return json({ ok: false, reason: 'format' }, 422);
    }

    const booking = await payload.create({
      collection: 'bookings',
      data: { ...fields, format: format.id, amount: format.price, status: 'pending' },
    });

    let payment: Awaited<ReturnType<typeof createPayment>>;

    try {
      payment = await createPayment({
        amount: booking.amount,
        description: `${format.title}: ${EXPERT.name}, ${EXPERT.role}`.slice(0, PAYMENT_DESCRIPTION_MAX_LENGTH),
        returnUrl: `${originOf(request)}${PAID_PATH}?booking=${booking.id}`,
        bookingId: String(booking.id),
        idempotenceKey: randomUUID(),
      });
    } catch (error) {
      console.error('Платеж за запись не создан:', error);
      await payload.delete({ collection: 'bookings', id: booking.id });

      return json({ ok: false, reason: 'payment' }, 502);
    }

    await payload.update({ collection: 'bookings', id: booking.id, data: { paymentId: payment.id } });

    return json({ confirmationUrl: payment.confirmationUrl });
  };
};
