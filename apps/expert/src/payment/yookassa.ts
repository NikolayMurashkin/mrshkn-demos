import { YOOKASSA_API_FALLBACK, YOOKASSA_CURRENCY } from './consts';
import type { NewPayment, YookassaPayment } from './types';

const envOf = (name: string) => process.env[name]?.trim() ?? '';

/** Без магазина платеж не создать и не проверить: это ошибка настройки, а не отказ платежа. */
const credentials = () => {
  const shopId = envOf('YOOKASSA_SHOP_ID');
  const secretKey = envOf('YOOKASSA_SECRET_KEY');

  if (!shopId || !secretKey) {
    throw new Error('ЮKassa не настроена: нет YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY');
  }

  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`;
};

const apiUrl = (path: string) => `${envOf('YOOKASSA_API_URL') || YOOKASSA_API_FALLBACK}${path}`;

/** Сумма для API: целые рубли с копейками, «4500.00». */
export const rubles = (amount: number) => amount.toFixed(2);

/** Платеж в одну стадию (`capture: true`) с переходом на страницу оплаты ЮKassa и возвратом на страницу «оплачено». */
export const createPayment = async ({ amount, description, returnUrl, bookingId, idempotenceKey }: NewPayment) => {
  const response = await fetch(apiUrl('/v3/payments'), {
    method: 'POST',
    headers: {
      authorization: credentials(),
      'content-type': 'application/json',
      'idempotence-key': idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: rubles(amount), currency: YOOKASSA_CURRENCY },
      capture: true,
      confirmation: { type: 'redirect', return_url: returnUrl },
      description,
      metadata: { bookingId },
    }),
  });

  if (!response.ok) {
    throw new Error(`ЮKassa не создала платеж: ${response.status}`);
  }

  const payment = (await response.json()) as YookassaPayment;

  if (!payment.id || !payment.confirmation?.confirmation_url) {
    throw new Error('ЮKassa вернула платеж без ссылки на оплату');
  }

  return { id: payment.id, confirmationUrl: payment.confirmation.confirmation_url };
};

/** Платеж по id из API магазина; `null` — такого платежа у магазина нет. Ответ API — единственный источник правды. */
export const fetchPayment = async (id: string): Promise<YookassaPayment | null> => {
  const response = await fetch(apiUrl(`/v3/payments/${encodeURIComponent(id)}`), {
    headers: { authorization: credentials() },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`ЮKassa не ответила о платеже: ${response.status}`);
  }

  return (await response.json()) as YookassaPayment;
};
