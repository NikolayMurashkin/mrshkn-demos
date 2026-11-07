import { NBSP } from '@mrshkn/demo-core/consts';
import { typograph } from '@mrshkn/demo-core/typograph';
import { BOOKING_CTA } from '../consts';

const amountFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** Цена прайса: «от 1 300 ₽» — разряды и знак рубля через неразрывный пробел. */
export const formatPriceFrom = (price: number) => `от${NBSP}${amountFormat.format(price).replace(/\s/g, NBSP)}${NBSP}₽`;

/** Длительность услуги из CMS: число не отрывается от единицы («1 ч», «45 мин»), между частями строка переносится. */
export const formatDuration = (duration: string) => typograph(duration).replace(/(\d) (?=\p{L})/gu, `$1${NBSP}`);

const plural = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
};

/** Стаж мастера: «Стаж 9 лет», «Стаж 4 года». */
export const formatYears = (years: number) => `Стаж ${years}${NBSP}${plural(years, 'год', 'года', 'лет')}`;

/** Кнопка записи к мастеру: «Записаться к Алине»; без имени в дательном — «Записаться». */
export const bookingLabel = (nameDative?: string | null) =>
  nameDative ? `${BOOKING_CTA} к${NBSP}${nameDative}` : BOOKING_CTA;

/** Подпись мастера под отзывом: «мастер — Алина». */
export const reviewMasterLabel = (name: string) => typograph(`мастер — ${name.split(' ')[0]}`);
