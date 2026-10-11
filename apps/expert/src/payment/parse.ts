import { parseLead } from '@mrshkn/demo-core/lead/parse';
import { DEMO } from '../demo.config';
import { WHEN_MAX_LENGTH } from './consts';
import type { BookingParseResult } from './types';

const textOf = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/**
 * Запись разбирается как заявка ядра — приманка, согласие, имя, связь, комментарий — плюс формат и «когда удобно».
 * Есть ли такой формат и сколько он стоит, решает CMS, а не тело запроса.
 */
export const parseBooking = (input: unknown): BookingParseResult => {
  const lead = parseLead(input, { demo: DEMO.slug, page: '/booking' });

  if (!lead.ok) {
    return lead;
  }

  const data = (input ?? {}) as Record<string, unknown>;
  const format = textOf(data.format);
  const when = textOf(data.when).slice(0, WHEN_MAX_LENGTH);

  if (!format || !when) {
    return { ok: false, reason: 'fields' };
  }

  const { name, contact, comment } = lead.lead;

  return { ok: true, booking: { format, name, contact, when, comment } };
};
