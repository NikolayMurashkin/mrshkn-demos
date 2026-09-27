import { COMMENT_MAX_LENGTH, CONTACT_MAX_LENGTH, HONEYPOT_FIELD, NAME_MAX_LENGTH } from '../consts';
import type { Lead, LeadContext, LeadParseResult } from '../types';

const textOf = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const parseLead = (input: unknown, context: LeadContext): LeadParseResult => {
  const data = (input ?? {}) as Record<string, unknown>;

  if (textOf(data[HONEYPOT_FIELD])) {
    return { ok: false, reason: 'honeypot' };
  }

  if (data.consent !== true) {
    return { ok: false, reason: 'consent' };
  }

  const name = textOf(data.name).slice(0, NAME_MAX_LENGTH);
  const contact = textOf(data.contact).slice(0, CONTACT_MAX_LENGTH);

  if (!name || !contact) {
    return { ok: false, reason: 'fields' };
  }

  return {
    ok: true,
    lead: {
      demo: context.demo,
      page: context.page,
      name,
      contact,
      comment: textOf(data.comment).slice(0, COMMENT_MAX_LENGTH),
    },
  };
};

/** Человеку — верхняя часть, поиску по заявкам — нижняя, как в заявках сайта студии. */
export const formatLead = (lead: Lead) =>
  [
    `Заявка с демо «${lead.demo}»`,
    '',
    `Имя: ${lead.name}`,
    `Связь: ${lead.contact}`,
    ...(lead.comment ? [`Комментарий: ${lead.comment}`] : []),
    '',
    `source=demo`,
    `demo=${lead.demo}`,
    `page=${lead.page}`,
  ].join('\n');
