import type { CollectionConfig } from 'payload';
import { MENU_ITEMS_COLLECTION } from '../consts';
import { MENU_CATEGORIES, MENU_TAGS } from '../seed/data';
import { validateMenuSlug, validatePrice } from '../validate';

const optionsOf = (options: { slug: string; name: string }[]) =>
  options.map(({ slug, name }) => ({ value: slug, label: name }));

/**
 * Позиции меню. Категория и признаки — варианты из констант кода, а не отдельные коллекции: по тем же slug
 * фильтр сверяет адрес, и чип не может сослаться на категорию, которой нет в коде.
 */
export const MenuItems: CollectionConfig = {
  slug: MENU_ITEMS_COLLECTION,
  labels: { singular: 'Позиция меню', plural: 'Меню' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'updatedAt'],
  },
  fields: [
    { name: 'name', label: 'Название', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Код позиции',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateMenuSlug,
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'text',
      admin: { description: 'Объем или состав одной строкой: «250 мл», «на сливочном масле»' },
    },
    { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 1, validate: validatePrice },
    {
      name: 'category',
      label: 'Категория',
      type: 'select',
      required: true,
      options: optionsOf(MENU_CATEGORIES),
    },
    {
      name: 'tags',
      label: 'Признаки',
      type: 'select',
      hasMany: true,
      options: optionsOf(MENU_TAGS),
    },
  ],
};
