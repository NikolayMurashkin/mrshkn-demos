import type {} from '@payloadcms/db-postgres';
import { notifyTelegram } from '@mrshkn/demo-core/lead/notify';
import { and, eq } from '@payloadcms/db-postgres/drizzle';
import type { Payload } from 'payload';
import { BOOKING_ID_PATTERN, YOOKASSA_CURRENCY } from './consts';
import { formatBookingMessage } from './message';
import type { PaymentConfirmation, YookassaPayment } from './types';
import { fetchPayment } from './yookassa';

const cents = (value: string) => Math.round(Number(value) * 100);

const bookingOf = async (payload: Payload, payment: YookassaPayment) => {
  const id = payment.metadata?.bookingId ?? '';

  if (!BOOKING_ID_PATTERN.test(id)) {
    return null;
  }

  return payload.findByID({ collection: 'bookings', id: Number(id), depth: 1, disableErrors: true });
};

/**
 * Pending → paid одним `UPDATE … WHERE status = 'pending'`: уведомление ЮKassa и страница «оплачено» могут прийти
 * одновременно, и запись переводит только один из них. Возвращает, перевел ли этот вызов.
 */
const markPaid = async (payload: Payload, id: number) => {
  const table = payload.db.tables.bookings;
  const now = new Date().toISOString();
  const updated = await payload.db.drizzle
    .update(table)
    .set({ status: 'paid', paidAt: now, updatedAt: now })
    .where(and(eq(table.id, id), eq(table.status, 'pending')))
    .returning({ id: table.id });

  return updated.length > 0;
};

/**
 * Подтверждение оплаты записи — общее для уведомления ЮKassa и страницы «оплачено». Телу уведомления не верим:
 * платеж берется из API магазина по id, и запись оплачена, только если API говорит `succeeded` и `paid`, сумма равна
 * сумме записи, а `metadata.bookingId` ведет на запись с этим же платежом. Сообщение в Telegram уходит один раз —
 * тому вызову, который перевел запись; упавший Telegram оплату не отменяет.
 */
export const confirmBookingPayment = async (payload: Payload, paymentId: string): Promise<PaymentConfirmation> => {
  let payment: YookassaPayment | null;

  try {
    payment = await fetchPayment(paymentId);
  } catch (error) {
    console.error('Платеж ЮKassa не проверить:', error);

    return 'unavailable';
  }

  if (!payment || payment.id !== paymentId || payment.status !== 'succeeded' || payment.paid !== true) {
    return 'rejected';
  }

  const booking = await bookingOf(payload, payment);

  if (
    !booking ||
    booking.paymentId !== payment.id ||
    payment.amount?.currency !== YOOKASSA_CURRENCY ||
    cents(payment.amount.value) !== booking.amount * 100
  ) {
    return 'rejected';
  }

  if (booking.status === 'paid' || !(await markPaid(payload, booking.id))) {
    return 'already';
  }

  try {
    await notifyTelegram(
      formatBookingMessage({
        ...booking,
        format: typeof booking.format === 'object' ? booking.format.title : String(booking.format),
      }),
    );
  } catch (error) {
    console.error('Уведомление об оплаченной записи не ушло в Telegram:', error);
  }

  return 'paid';
};
