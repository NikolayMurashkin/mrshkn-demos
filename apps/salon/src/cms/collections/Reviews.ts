import { createReviews } from '@mrshkn/demo-core/cms/reviews';
import type { CollectionConfig } from 'payload';
import { MASTERS_COLLECTION } from '../consts';

/**
 * Свой экземпляр коллекции ядра, а не общий `Reviews`: Payload дописывает в объект коллекции разобранные поля,
 * и копия общего объекта, уже разобранного конфигом другого демо, теряла бы поле мастера.
 */
const CoreReviews = createReviews();

/**
 * Вымышленные отзывы ядра (подпись «Имя Ф.», без фото и оценок) и мастер отзыва: по нему страница мастера
 * показывает только его отзывы, а подпись — «мастер — Алина».
 */
export const Reviews: CollectionConfig = {
  ...CoreReviews,
  admin: { ...CoreReviews.admin, defaultColumns: ['author', 'subject', 'master', 'createdAt'] },
  fields: [
    ...CoreReviews.fields.map((field) =>
      field.type === 'text' && field.name === 'subject'
        ? {
            ...field,
            admin: { ...field.admin, description: 'Услуга одним-двумя словами: «маникюр», «свадебный макияж»' },
          }
        : field,
    ),
    {
      name: 'master',
      label: 'Мастер',
      type: 'relationship',
      relationTo: MASTERS_COLLECTION,
      admin: { description: 'Пусто — отзыв о салоне, без мастера' },
    },
  ],
};
