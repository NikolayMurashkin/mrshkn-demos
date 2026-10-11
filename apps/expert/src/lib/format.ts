import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoAddress } from '@mrshkn/demo-core/types';
import { MINUTE_FORMS } from '../consts';

const amountFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Сумма в рублях по-русски: разряды с тысяч через неразрывный пробел. */
export const formatPrice = (amount: number) => `${amountFormat.format(amount)}${NBSP}₽`;

/** Форма слова после числа: 1 минута, 2 минуты, 5 минут. */
export const plural = (count: number, [one, few, many]: [string, string, string]) => {
  const tens = count % 100;
  const units = count % 10;

  if (units === 1 && tens !== 11) {
    return one;
  }

  return units >= 2 && units <= 4 && (tens < 12 || tens > 14) ? few : many;
};

const formatMinutes = (count: number) => `${count}${NBSP}${plural(count, MINUTE_FORMS)}`;

/** «50 минут · онлайн или очно» — строка формата под названием. */
export const formatMeta = ({ duration, place }: { duration: number; place: string }) =>
  `${formatMinutes(duration)} · ${place}`;

/** «10 октября 2026» без «г.»: дата статьи. */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso)).replace(/\s*г\.$/, '');

export const addressText = ({ addressLocality, streetAddress }: DemoAddress) => `${addressLocality}, ${streetAddress}`;
