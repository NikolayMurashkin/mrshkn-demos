import type { WaitlistErrorKind } from './types';

/**
 * Ответ обработчика → какую ошибку показать форме: 422 с известной причиной — у своего поля, 429 — лимит попыток,
 * остальное (сбой сервера, сеть, неизвестная причина) — общая ошибка отправки.
 */
export const waitlistErrorKind = (status: number, reason: unknown): WaitlistErrorKind => {
  if (status === 429) {
    return 'rate';
  }

  if (status === 422 && (reason === 'consent' || reason === 'email')) {
    return reason;
  }

  return 'failed';
};
