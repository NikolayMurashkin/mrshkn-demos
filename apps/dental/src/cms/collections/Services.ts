import type { CollectionConfig } from 'payload';
import { validatePageSlug } from '../validate';

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Услуга', plural: 'Услуги' },
  orderable: true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Адрес страницы',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validatePageSlug,
      admin: { description: 'Страница услуги откроется по адресу /services/<адрес>' },
    },
    { name: 'summary', label: 'Коротко', type: 'textarea', required: true },
    {
      name: 'priceFrom',
      label: 'Цена «от» в списке услуг, ₽',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Цена самого частого лечения, а не консультации или анестезии' },
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      required: true,
      admin: { description: 'Абзацы разделяются пустой строкой' },
    },
    {
      name: 'prices',
      label: 'Прайс',
      labels: { singular: 'Позиция', plural: 'Позиции' },
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'name', label: 'Позиция', type: 'text', required: true },
        { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0 },
        { name: 'from', label: 'Цена «от»', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
};
