import { COMMENT_MAX_LENGTH, CONTACT_MAX_LENGTH, HONEYPOT_FIELD, NAME_MAX_LENGTH } from '@mrshkn/demo-core/consts';
import { formatLead, parseLead } from '@mrshkn/demo-core/lead/parse';
import { describe, expect, it } from 'vitest';

const CONTEXT = { demo: 'dental', page: '/' };

const VALID = { name: 'Анна', contact: '@anna', comment: 'Хочу на чистку', consent: true };

describe('заявка из формы демо', () => {
  it('принимает имя, связь и комментарий и помечает демо и страницу', () => {
    expect(parseLead(VALID, CONTEXT)).toEqual({
      ok: true,
      lead: { demo: 'dental', page: '/', name: 'Анна', contact: '@anna', comment: 'Хочу на чистку' },
    });
  });

  it('обрезает пробелы по краям', () => {
    const result = parseLead({ ...VALID, name: '  Анна  ', contact: ' @anna ' }, CONTEXT);

    expect(result.ok && result.lead.name).toBe('Анна');
    expect(result.ok && result.lead.contact).toBe('@anna');
  });

  it('комментарий необязателен', () => {
    const result = parseLead({ ...VALID, comment: undefined }, CONTEXT);

    expect(result.ok && result.lead.comment).toBe('');
  });

  it.each([
    ['без имени', { ...VALID, name: ' ' }],
    ['без связи', { ...VALID, contact: '' }],
    ['имя не строкой', { ...VALID, name: 42 }],
    ['пустое тело', null],
  ])('отказывает заявке %s', (_, input) => {
    expect(parseLead(input, CONTEXT)).toEqual({ ok: false, reason: expect.stringMatching(/fields|consent/) });
  });

  it('без согласия на обработку данных не принимает', () => {
    expect(parseLead({ ...VALID, consent: 'on' }, CONTEXT)).toEqual({ ok: false, reason: 'consent' });
    expect(parseLead({ ...VALID, consent: false }, CONTEXT)).toEqual({ ok: false, reason: 'consent' });
  });

  it('заполненная приманка — бот', () => {
    expect(parseLead({ ...VALID, [HONEYPOT_FIELD]: 'x' }, CONTEXT)).toEqual({ ok: false, reason: 'honeypot' });
  });

  it('режет поля до предела', () => {
    const result = parseLead(
      { ...VALID, name: 'я'.repeat(500), contact: '1'.repeat(500), comment: 'к'.repeat(5000) },
      CONTEXT,
    );

    expect(result.ok && result.lead.name).toHaveLength(NAME_MAX_LENGTH);
    expect(result.ok && result.lead.contact).toHaveLength(CONTACT_MAX_LENGTH);
    expect(result.ok && result.lead.comment).toHaveLength(COMMENT_MAX_LENGTH);
  });

  it('текст уведомления говорит, с какого демо заявка, и несет все поля', () => {
    const text = formatLead({ demo: 'dental', page: '/uslugi', name: 'Анна', contact: '@anna', comment: 'Чистка' });

    expect(text).toContain('dental');
    expect(text).toContain('Анна');
    expect(text).toContain('@anna');
    expect(text).toContain('Чистка');
    expect(text).toContain('page=/uslugi');
  });
});
