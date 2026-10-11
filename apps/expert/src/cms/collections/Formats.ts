import type { CollectionConfig } from 'payload';
import { validatePageSlug, validatePrice } from '../validate';

export const Formats: CollectionConfig = {
  slug: 'formats',
  labels: { singular: 'Формат', plural: 'Форматы' },
  orderable: true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'duration', 'price', 'updatedAt'],
  },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Адрес',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validatePageSlug,
      admin: { description: 'Запись на формат откроется по адресу /booking?format=<адрес>' },
    },
    { name: 'duration', label: 'Длительность, минут', type: 'number', required: true, min: 1 },
    {
      name: 'place',
      label: 'Где',
      type: 'text',
      required: true,
      admin: { description: '«онлайн», «онлайн или очно»' },
    },
    {
      name: 'price',
      label: 'Цена, ₽',
      type: 'number',
      required: true,
      validate: validatePrice,
      admin: { description: 'Эту сумму клиент платит при записи', step: 1 },
    },
    { name: 'summary', label: 'Описание', type: 'textarea', required: true },
  ],
};
