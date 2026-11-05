import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { CONCERT, DATE_LOCALES, TIME_ZONE } from '../consts';

const DAY_MS = 86_400_000;

const zoneParts = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

/** Часы на стене в Калининграде в момент `date` — как момент UTC с теми же цифрами. */
const wallClock = (date: Date) => {
  const parts = Object.fromEntries(zoneParts.formatToParts(date).map(({ type, value }) => [type, Number(value)]));

  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
};

/** Момент, когда в Калининграде на часах `hour`:00 дня `day` (полночь UTC календарной даты). */
const kaliningradMoment = (day: number, hour: number) => {
  const guess = day + hour * 3_600_000;

  return new Date(guess - (wallClock(new Date(guess)) - guess));
};

/**
 * Начало концерта: суббота в 19:00 по Калининграду, через 21–27 дней от сегодняшней даты по Калининграду. Пояс
 * сервера не участвует: «сегодня» и день недели — по часам Калининграда.
 */
export const concertDate = (now: Date) => {
  const today = Math.floor(wallClock(now) / DAY_MS) * DAY_MS;
  const toWeekday = (CONCERT.weekday - new Date(today).getUTCDay() + 7) % 7;

  return kaliningradMoment(today + (CONCERT.minDaysAhead + toWeekday) * DAY_MS, CONCERT.startHour);
};

/** День недели и дата по Калининграду: «суббота, 28 ноября», «Saturday, November 28»; число не отрывается от месяца. */
export const formatConcertDate = (date: Date, lang: DemoLang) =>
  new Intl.DateTimeFormat(DATE_LOCALES[lang], { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' })
    .format(date)
    .replace(/(\d)\s/gu, `$1${NBSP}`);

/** Число месяца по Калининграду — для бейджа первого экрана. */
export const concertDay = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, day: 'numeric' }).format(date);
