import type { CollectionConfig } from 'payload';

/**
 * Адреса пишет только обработчик формы через локальный API; через REST и админку их не создать и не поправить,
 * как заявку ядра. Читает список только вошедший: это данные посетителей. Повтор адреса держит уникальный индекс
 * в базе, а не проверка «найди, потом создай» — она пропустила бы два одновременных запроса.
 */
export const Waitlist: CollectionConfig = {
  slug: 'waitlist',
  labels: { singular: 'Адрес в списке ожидания', plural: 'Список ожидания' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'createdAt'],
  },
  access: {
    create: () => false,
    update: () => false,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'email',
      label: 'Почта',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'В нижнем регистре: регистр почты не различается' },
    },
  ],
};
