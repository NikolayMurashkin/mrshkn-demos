import { existsSync } from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type Lang = 'ru' | 'en';

type ConcertDateModule = {
  concertDate: (now: Date) => Date;
  formatConcertDate: (date: Date, lang: Lang) => string;
  concertDay: (date: Date) => string;
};

const EVENT_SRC = path.resolve(import.meta.dirname, '../../apps/event/src');

/** Модуль демо «Концерт»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importEvent = async <T>(relative: string): Promise<T> => {
  const file = path.join(EVENT_SRC, relative);

  expect(existsSync(file), `нет apps/event/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const loadDate = () => importEvent<ConcertDateModule>('lib/concert-date.ts');

const TIME_ZONE = 'Europe/Kaliningrad';

/** Календарная дата по Калининграду: `2026-11-02`. */
const kaliningradDay = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    date,
  );

const kaliningradWeekday = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'long' }).format(date);

/** Разница календарных дат по Калининграду в днях, без учета часов. */
const daysBetween = (from: Date, to: Date) =>
  (Date.parse(kaliningradDay(to)) - Date.parse(kaliningradDay(from))) / 86_400_000;

/** Пояс машины — не Калининград: расчет по поясу машины, а не по Калининграду, падает и там, где машина в Калининграде. */
const MACHINE_TIME_ZONE = 'UTC';

const previousTimeZone = process.env.TZ;

beforeAll(() => {
  process.env.TZ = MACHINE_TIME_ZONE;
});

afterAll(() => {
  if (previousTimeZone === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = previousTimeZone;
  }
});

/** 12:00 по Калининграду (UTC+2) каждого дня недели с понедельника 02.11.2026. */
const WEEK = [
  { day: 'понедельник 02.11', now: '2026-11-02T10:00:00Z', expected: '2026-11-28T17:00:00.000Z', days: 26 },
  { day: 'вторник 03.11', now: '2026-11-03T10:00:00Z', expected: '2026-11-28T17:00:00.000Z', days: 25 },
  { day: 'среда 04.11', now: '2026-11-04T10:00:00Z', expected: '2026-11-28T17:00:00.000Z', days: 24 },
  { day: 'четверг 05.11', now: '2026-11-05T10:00:00Z', expected: '2026-11-28T17:00:00.000Z', days: 23 },
  { day: 'пятница 06.11', now: '2026-11-06T10:00:00Z', expected: '2026-11-28T17:00:00.000Z', days: 22 },
  { day: 'суббота 07.11', now: '2026-11-07T10:00:00Z', expected: '2026-11-28T17:00:00.000Z', days: 21 },
  { day: 'воскресенье 08.11', now: '2026-11-08T10:00:00Z', expected: '2026-12-05T17:00:00.000Z', days: 27 },
];

describe('дата концерта — суббота через 21–27 дней по Калининграду', () => {
  it.each(WEEK.map(({ day, now, expected, days }) => [day, expected, days, now] as const))(
    'полдень по Калининграду, %s — концерт %s, суббота, через %i дн.',
    async (_day, expected, days, now) => {
      const { concertDate } = await loadDate();
      const today = new Date(now);
      const concert = concertDate(today);

      expect(concert.toISOString()).toBe(expected);
      expect(kaliningradWeekday(concert)).toBe('Saturday');
      expect(daysBetween(today, concert)).toBe(days);
      expect(daysBetween(today, concert)).toBeGreaterThanOrEqual(21);
      expect(daysBetween(today, concert)).toBeLessThanOrEqual(27);
    },
  );

  it('смена суток по Калининграду: сб 23:59:59 — 28 ноября, вс 00:00 (по UTC еще суббота) — 5 декабря', async () => {
    const { concertDate } = await loadDate();

    expect(concertDate(new Date('2026-11-07T21:59:59Z')).toISOString()).toBe('2026-11-28T17:00:00.000Z');
    expect(concertDate(new Date('2026-11-07T22:00:00Z')).toISOString()).toBe('2026-12-05T17:00:00.000Z');
  });

  it('смена года: вс 20.12.2026 — суббота 16 января 2027', async () => {
    const { concertDate } = await loadDate();

    expect(concertDate(new Date('2026-12-20T10:00:00Z')).toISOString()).toBe('2027-01-16T17:00:00.000Z');
  });
});

describe('формат даты концерта ru и en', () => {
  it('28 ноября: ru — «суббота, 28 ноября» с неразрывным пробелом, en — «Saturday, November 28»', async () => {
    const { formatConcertDate } = await loadDate();
    const date = new Date('2026-11-28T17:00:00Z');

    expect(formatConcertDate(date, 'ru')).toBe('суббота, 28\u00a0ноября');
    expect(formatConcertDate(date, 'en')).toBe('Saturday, November 28');
  });

  it('16 января: ru — «суббота, 16 января», en — «Saturday, January 16»', async () => {
    const { formatConcertDate } = await loadDate();
    const date = new Date('2027-01-16T17:00:00Z');

    expect(formatConcertDate(date, 'ru')).toBe('суббота, 16\u00a0января');
    expect(formatConcertDate(date, 'en')).toBe('Saturday, January 16');
  });

  it('вс 00:30 по Калининграду (по UTC еще суббота) — «воскресенье, 29 ноября»', async () => {
    const { formatConcertDate } = await loadDate();

    expect(formatConcertDate(new Date('2026-11-28T22:30:00Z'), 'ru')).toBe('воскресенье, 29\u00a0ноября');
  });
});

describe('число месяца для бейджа первого экрана', () => {
  it.each([
    ['2026-11-28T17:00:00Z', '28', 'суббота 28 ноября'],
    ['2026-12-05T17:00:00Z', '5', 'суббота 5 декабря — без ведущего нуля'],
    ['2026-11-28T22:30:00Z', '29', 'вс 00:30 по Калининграду, по UTC еще 28-е'],
  ])('D7: concertDay(%s) — «%s», %s', async (at, day) => {
    const { concertDay } = await loadDate();

    expect(concertDay(new Date(at))).toBe(day);
  });
});
