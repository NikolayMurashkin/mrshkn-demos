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
    {
      name: 'accreditation',
      label: 'Аккредитация или сертификат специалиста',
      type: 'group',
      admin: { description: 'Документ, который дает врачу право лечить; на странице врача — со сроком действия' },
      fields: [
        {
          name: 'kind',
          label: 'Документ',
          type: 'select',
          required: true,
          defaultValue: 'accreditation',
          options: [
            { label: 'Аккредитация специалиста', value: 'accreditation' },
            { label: 'Сертификат специалиста', value: 'certificate' },
          ],
        },
        { name: 'specialty', label: 'Специальность', type: 'text', required: true },
        {
          name: 'validUntil',
          label: 'Действует до',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
      ],
    },
    {
      name: 'schedule',
      label: 'График приема',
      labels: { singular: 'Строка', plural: 'Строки' },
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'days',
          label: 'Дни',
          type: 'text',
          required: true,
          admin: { description: '«Пн, ср, пт», «Ежедневно»' },
        },
        { name: 'hours', label: 'Часы', type: 'text', required: true, admin: { description: '«9:00–15:00»' } },
      ],
    },
  ],
};
