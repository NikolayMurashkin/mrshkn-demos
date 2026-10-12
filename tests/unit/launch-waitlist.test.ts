import { HONEYPOT_FIELD } from '@mrshkn/demo-core/consts';
import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

type WaitlistResult = { ok: true; email: string } | { ok: false; reason: 'honeypot' | 'consent' | 'email' };

const LAUNCH_SRC = path.resolve(import.meta.dirname, '../../apps/launch/src');

/** Модуль демо «SaaS-лендинг»: пока его нет, тест падает на assert, а не на сборке файла. */
const importLaunch = async <T>(relative: string): Promise<T> => {
  const file = path.join(LAUNCH_SRC, relative);

  expect(existsSync(file), `нет apps/launch/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let parseWaitlist: (input: unknown) => WaitlistResult;

type WaitlistErrorKind = 'email' | 'consent' | 'rate' | 'failed';

let waitlistErrorKind: (status: number, reason: unknown) => WaitlistErrorKind;

beforeAll(async () => {
  ({ parseWaitlist } = await importLaunch<{ parseWaitlist: typeof parseWaitlist }>('waitlist/parse.ts'));
});

const VALID_EMAIL = 'anna@example.com';

/**
 * Адрес верного вида заданной длины, годный и по RFC: локальная часть 64 знака, метки домена не длиннее 63 —
 * граница длины проверяется сама по себе, а не вместе с другими ограничениями.
 */
const emailOfLength = (length: number) => {
  const local = 'a'.repeat(64);
  const domainLength = length - local.length - 1;
  const tail = domainLength - 2 * 64;

  return `${local}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(tail)}`;
};

describe('разбор заявки в список ожидания', () => {
  it('P1: адрес с пробелами по краям и в разном регистре — принят, обрезан и в нижнем регистре', () => {
    expect(parseWaitlist({ email: '  Anna@Example.COM ', consent: true })).toEqual({
      ok: true,
      email: 'anna@example.com',
    });
  });

  it.each([
    ['false', { consent: false }],
    ["'on'", { consent: 'on' }],
    ["'true'", { consent: 'true' }],
    ['1', { consent: 1 }],
    ['нет поля', {}],
  ])('P2: согласие %s при верной почте — отказ «consent»', (_label, consent) => {
    expect(parseWaitlist({ email: VALID_EMAIL, ...consent })).toEqual({ ok: false, reason: 'consent' });
  });

  it.each([
    ["''", ''],
    ["'   '", '   '],
    ["'anna'", 'anna'],
    ["'anna@'", 'anna@'],
    ["'@example.com'", '@example.com'],
    ["'anna@example'", 'anna@example'],
    ["'an na@example.com'", 'an na@example.com'],
    ["'anna@@example.com'", 'anna@@example.com'],
    ['255 знаков верного вида', emailOfLength(255)],
    ['42', 42],
    ['null', null],
    ['{}', {}],
  ])('P3: почта %s при согласии — отказ «email»', (_label, email) => {
    expect(parseWaitlist({ email, consent: true })).toEqual({ ok: false, reason: 'email' });
  });

  it('P3: почта ровно 254 знака верного вида — принята', () => {
    const email = emailOfLength(254);

    expect(email).toHaveLength(254);
    expect(parseWaitlist({ email, consent: true })).toEqual({ ok: true, email });
  });

  it('P4: заполненная приманка — отказ «honeypot», даже без согласия и с неверной почтой', () => {
    expect(parseWaitlist({ email: 'not-an-email', [HONEYPOT_FIELD]: 'x' })).toEqual({
      ok: false,
      reason: 'honeypot',
    });
    expect(parseWaitlist({ email: VALID_EMAIL, consent: true, [HONEYPOT_FIELD]: 'x' })).toEqual({
      ok: false,
      reason: 'honeypot',
    });
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['строка', 'anna@example.com'],
    ['массив', [VALID_EMAIL, true]],
  ])('P5: вход %s — результат с ok: false без исключения', (_label, input) => {
    let result: WaitlistResult | undefined;

    expect(() => {
      result = parseWaitlist(input);
    }).not.toThrow();
    expect(result?.ok).toBe(false);
  });
});

describe('ответ сервера на форме списка ожидания', () => {
  beforeAll(async () => {
    ({ waitlistErrorKind } = await importLaunch<{ waitlistErrorKind: typeof waitlistErrorKind }>('waitlist/errors.ts'));
  });

  it('E1: 422 «consent» — ошибка у согласия', () => {
    expect(waitlistErrorKind(422, 'consent')).toBe('consent');
  });

  it('E2: 422 «email» — ошибка у почты', () => {
    expect(waitlistErrorKind(422, 'email')).toBe('email');
  });

  it('E3: 429 — лимит попыток, а не ошибка поля', () => {
    expect(waitlistErrorKind(429, 'rate')).toBe('rate');
    expect(waitlistErrorKind(429, undefined)).toBe('rate');
  });

  it.each([
    ['422 с неизвестной причиной', 422, 'other'],
    ['422 без причины', 422, undefined],
    ['500', 500, undefined],
    ['502 с причиной consent', 502, 'consent'],
    ['0 (сеть)', 0, undefined],
  ])('E4: %s — общая ошибка отправки', (_label, status, reason) => {
    expect(waitlistErrorKind(status, reason)).toBe('failed');
  });
});

/** Текст политики без разметки, неразрывные пробелы — обычными. */
const policyText = (props: Parameters<typeof PrivacyPolicy>[0]) =>
  renderToStaticMarkup(createElement(PrivacyPolicy, props))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ');

describe('политика демо со списком ожидания', () => {
  it('PP1: вариант «waitlist» говорит только о почте — без заявки, телефона и Telegram', () => {
    const text = policyText({ withYandexReviews: false, form: 'waitlist' });

    expect(text).toContain('адрес почты');
    expect(text).not.toContain('Telegram');
    expect(text).not.toContain('телефон');
    expect(text.toLowerCase()).not.toContain('заявк');
  });

  it('PP2: без варианта — прежний текст формы заявки', () => {
    const text = policyText({ withYandexReviews: false });

    expect(text).toContain('имя, телефон');
    expect(text).toContain('Telegram');
  });

  it('PP3: вариант «waitlist» на английском — почта, без Telegram и кириллицы', () => {
    const text = policyText({ withYandexReviews: false, form: 'waitlist', lang: 'en' });

    expect(text).toContain('email address');
    expect(text).not.toContain('Telegram');
    expect(text).not.toMatch(/[а-яё]/i);
  });
});
