import type { CollectionConfig } from 'payload';
import { PRACTICE_SINCE_MIN } from '../consts';
import { validatePageSlug } from '../validate';

export const Doctors: CollectionConfig = {
  slug: 'doctors',
  labels: { singular: 'Врач', plural: 'Врачи' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'updatedAt'],
  },
  fields: [
    { name: 'name', label: 'Фамилия, имя, отчество', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Адрес страницы',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validatePageSlug,
      admin: { description: 'Страница врача откроется по адресу /doctors/<адрес>' },
    },
    { name: 'position', label: 'Специальность', type: 'text', required: true },
    {
      name: 'practiceSince',
      label: 'В профессии с (год)',
      type: 'number',
      required: true,
      min: PRACTICE_SINCE_MIN,
    },
    {
      name: 'about',
      label: 'О враче',
      type: 'textarea',
      required: true,
      admin: { description: 'Абзацы разделяются пустой строкой' },
    },
    {
      name: 'education',
      label: 'Образование',
      labels: { singular: 'Строка', plural: 'Строки' },
      type: 'array',
      fields: [{ name: 'item', label: 'Что и когда', type: 'text', required: true }],
    },
    { name: 'services', label: 'Услуги', type: 'relationship', relationTo: 'services', hasMany: true },
  ],
};
