import type { CollectionConfig } from 'payload';
import { SERVICES_COLLECTION } from '../consts';
import { validatePrice, validateSlug } from '../validate';
import { CATEGORY_OPTIONS } from './options';

/** Строки прайса: услуга, длительность и цена «от» в группе своего направления. Порядок — из админки. */
export const Services: CollectionConfig = {
  slug: SERVICES_COLLECTION,
  labels: { singular: 'Услуга', plural: 'Услуги и цены' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'updatedAt'],
  },
  fields: [
    { name: 'name', label: 'Название', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Код услуги',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
    },
    { name: 'category', label: 'Направление', type: 'select', required: true, options: CATEGORY_OPTIONS },
    {
      name: 'duration',
      label: 'Длительность',
      type: 'text',
      required: true,
      admin: { description: 'Словами: «60 мин», «1 ч 45 мин»' },
    },
    { name: 'price', label: 'Цена от, ₽', type: 'number', required: true, min: 1, validate: validatePrice },
  ],
};
