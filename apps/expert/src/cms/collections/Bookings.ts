import type { CollectionConfig } from 'payload';
import { BOOKING_STATUSES } from '../consts';

/**
 * Записи пишет только обработчик записи, оплаченными их помечает только подтверждение ЮKassa — через локальный API.
 * Из админки и REST запись не создать и не поправить, как заявку ядра.
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Запись', plural: 'Записи' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'format', 'status', 'when', 'createdAt'],
  },
  access: {
    create: () => false,
    update: () => false,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    { name: 'contact', label: 'Связь', type: 'text', required: true },
    { name: 'when', label: 'Когда удобно', type: 'text', required: true },
    { name: 'comment', label: 'Комментарий', type: 'textarea' },
    { name: 'format', label: 'Формат', type: 'relationship', relationTo: 'formats', required: true },
    {
      name: 'amount',
      label: 'Сумма, ₽',
      type: 'number',
      required: true,
      admin: { description: 'Цена формата в момент записи' },
    },
    {
      name: 'status',
      label: 'Оплата',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'pending',
      options: [...BOOKING_STATUSES],
    },
    { name: 'paymentId', label: 'Платеж ЮKassa', type: 'text', index: true },
    { name: 'paidAt', label: 'Оплачена', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
  ],
};
