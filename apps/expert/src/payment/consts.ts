export const YOOKASSA_API_FALLBACK = 'https://api.yookassa.ru';

export const YOOKASSA_CURRENCY = 'RUB';

/** Событие уведомления, на которое отвечает демо: платеж с `capture: true` сразу становится `succeeded`. */
export const YOOKASSA_EVENT_SUCCEEDED = 'payment.succeeded';

/** Описание платежа в ЮKassa — до 128 знаков. */
export const PAYMENT_DESCRIPTION_MAX_LENGTH = 128;

export const BOOKING_ENDPOINT = '/api/booking';

export const PAID_PATH = '/booking/paid';

export const WHEN_MAX_LENGTH = 200;

/** Id записи в адресе страницы «оплачено» и в `metadata.bookingId` платежа. */
export const BOOKING_ID_PATTERN = /^\d+$/;
