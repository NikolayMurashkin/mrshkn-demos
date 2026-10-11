import { DEMO } from '../demo.config';
import { formatPrice } from '../lib/format';
import type { BookingMessage } from './types';

/** Человеку — верхняя часть, поиску по уведомлениям — нижняя, как в заявке ядра. */
export const formatBookingMessage = ({ id, name, contact, when, comment, format, amount }: BookingMessage) =>
  [
    `Оплаченная запись с демо «${DEMO.slug}»`,
    '',
    `Имя: ${name}`,
    `Связь: ${contact}`,
    `Когда удобно: ${when}`,
    `Формат: ${format}`,
    `Сумма: ${formatPrice(amount)}`,
    ...(comment ? [`Комментарий: ${comment}`] : []),
    '',
    'source=demo',
    `demo=${DEMO.slug}`,
    `booking=${id}`,
  ].join('\n');
