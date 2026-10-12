import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoAddress } from '@mrshkn/demo-core/types';
import { WEEKDAYS } from '../consts';
import type { HoursRow } from '../types';

const amountFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** Цена в рублях: разряды с тысяч и знак рубля — через неразрывный пробел. */
export const formatPrice = (price: number) => `${amountFormat.format(price)}${NBSP}₽`;

/** Ссылка для звонка: «+7 952 000-00-21» → `tel:+79520000021`. */
export const phoneHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`;

export const addressText = ({ addressLocality, streetAddress }: DemoAddress) => `${addressLocality}, ${streetAddress}`;

const dayLabel = (days: string) =>
  days
    .split('-')
    .map((day) => WEEKDAYS[day] ?? day)
    .join('–');

const timeLabel = (time: string) =>
  time
    .split('-')
    .map((part) => part.replace(/^0(?=\d:)/, ''))
    .join('–');

/** Часы schema.org (`Mo-Fr 08:00-21:00`) → строка таблицы «пн–пт», «8:00–21:00»: часы и разметка из одних данных. */
export const hoursRows = (openingHours: string[]): HoursRow[] =>
  openingHours.map((entry) => {
    const [days = '', time = ''] = entry.split(' ');

    return { days: dayLabel(days), time: timeLabel(time) };
  });
