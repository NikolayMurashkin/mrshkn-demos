import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: { useAsTitle: 'email' },
  auth: true,
  fields: [],
};

/** Заявки пишет только обработчик формы через локальный API; через REST их не создать и не поправить. */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'contact', 'page', 'createdAt'],
  },
  access: {
    create: () => false,
    update: () => false,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    { name: 'contact', label: 'Связь', type: 'text', required: true },
    { name: 'comment', label: 'Комментарий', type: 'textarea' },
    { name: 'demo', label: 'Демо', type: 'text', required: true },
    { name: 'page', label: 'Страница', type: 'text' },
  ],
};
