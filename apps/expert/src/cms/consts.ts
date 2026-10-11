/** Адрес формата или статьи: латиница в нижнем регистре, цифры и дефис между ними. */
export const PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Запись ждет оплаты, пока ЮKassa не подтвердит платеж; оплаченной ее делает только подтверждение API. */
export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Ждет оплаты' },
  { value: 'paid', label: 'Оплачена' },
] as const;
