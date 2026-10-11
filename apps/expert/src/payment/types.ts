import type { SanitizedConfig } from 'payload';

export type PaymentRouteOptions = {
  config: Promise<SanitizedConfig> | SanitizedConfig;
};

export type YookassaAmount = {
  value: string;
  currency: string;
};

/** Платеж в ответе API ЮKassa: только поля, по которым демо решает, оплачена ли запись. */
export type YookassaPayment = {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid: boolean;
  amount: YookassaAmount;
  metadata?: Record<string, string>;
  confirmation?: { type: string; confirmation_url?: string };
};

export type NewPayment = {
  /** Целые рубли. */
  amount: number;
  description: string;
  returnUrl: string;
  bookingId: string;
  /** Ключ идемпотентности ЮKassa: повтор того же запроса не создаст второй платеж. */
  idempotenceKey: string;
};

type BookingInput = {
  format: string;
  name: string;
  contact: string;
  when: string;
  comment: string;
};

type BookingRejection = 'honeypot' | 'consent' | 'fields';

export type BookingParseResult = { ok: true; booking: BookingInput } | { ok: false; reason: BookingRejection };

/**
 * Итог проверки платежа: `paid` — этот вызов перевел запись в оплаченные, `already` — запись уже была оплачена,
 * `rejected` — API ЮKassa платеж не подтверждает, `unavailable` — API не ответил, проверить нельзя.
 */
export type PaymentConfirmation = 'paid' | 'already' | 'rejected' | 'unavailable';

export type BookingMessage = {
  id: number | string;
  name: string;
  contact: string;
  when: string;
  comment?: string | null;
  format: string;
  amount: number;
};
