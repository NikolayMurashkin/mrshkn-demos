import { validatePhotoKey } from '@mrshkn/demo-core/photo';
import type { CollectionConfig } from 'payload';
import { PHOTO_KEYS } from '../../assets/photos/keys';
import { MASTERS_COLLECTION } from '../consts';
import { validateSlug, validateYears } from '../validate';
import { CATEGORY_OPTIONS } from './options';

/** Мастера салона: карточки главной и `/masters`, страница `/masters/<код>`. Порядок — из админки. */
export const Masters: CollectionConfig = {
  slug: MASTERS_COLLECTION,
  labels: { singular: 'Мастер', plural: 'Мастера' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'years', 'updatedAt'],
  },
  fields: [
    { name: 'name', label: 'Имя и фамилия', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Код мастера',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
      admin: { description: 'Часть адреса страницы: /masters/<код>' },
    },
    {
      name: 'nameDative',
      label: 'Имя в дательном падеже',
      type: 'text',
      admin: { description: 'Для кнопки «Записаться к …»: «Алине»; пусто — «Записаться»' },
    },
    { name: 'role', label: 'Специализация', type: 'text', required: true },
    { name: 'years', label: 'Стаж, лет', type: 'number', required: true, min: 1, validate: validateYears },
    { name: 'about', label: 'О мастере', type: 'textarea', required: true },
    {
      name: 'categories',
      label: 'Направления',
      type: 'select',
      hasMany: true,
      required: true,
      options: CATEGORY_OPTIONS,
      admin: { description: 'Группы прайса на странице мастера' },
    },
    {
      name: 'photo',
      label: 'Фото (ключ кадра)',
      type: 'text',
      validate: validatePhotoKey(PHOTO_KEYS),
      admin: { description: 'Ключ из src/assets/photos/index.ts приложения; пусто — плита с каплями' },
    },
  ],
};
