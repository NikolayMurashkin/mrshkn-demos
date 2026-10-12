import { HONEYPOT_FIELD } from '@mrshkn/demo-core/consts';
import { WAITLIST_EMAIL_MAX_LENGTH, WAITLIST_EMAIL_PATTERN } from './consts';
import type { WaitlistParseResult } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Регистр почты не различается: `Anna@Example.com` и `anna@example.com` — один адрес и одна запись в списке. */
export const normalizeEmail = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

export const isWaitlistEmail = (email: string) =>
  email.length <= WAITLIST_EMAIL_MAX_LENGTH && WAITLIST_EMAIL_PATTERN.test(email);

/** Порядок как у заявки ядра: приманка, согласие, поля — боту отвечают раньше, чем проверяют остальное. */
export const parseWaitlist = (input: unknown): WaitlistParseResult => {
  const data = isRecord(input) ? input : {};
  const trap = data[HONEYPOT_FIELD];

  if (typeof trap === 'string' && trap.trim()) {
    return { ok: false, reason: 'honeypot' };
  }

  if (data.consent !== true) {
    return { ok: false, reason: 'consent' };
  }

  const email = normalizeEmail(data.email);

  if (!isWaitlistEmail(email)) {
    return { ok: false, reason: 'email' };
  }

  return { ok: true, email };
};
