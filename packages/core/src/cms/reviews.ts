import type { CollectionConfig, TextFieldSingleValidation } from 'payload';
import { REVIEW_AUTHOR_PATTERN } from '../consts';

export const isReviewAuthor = (author: string) => REVIEW_AUTHOR_PATTERN.test(author);

const validateReviewAuthor: TextFieldSingleValidation = (value) =>
  isReviewAuthor(value ?? '') || 'Имя и первая буква фамилии кириллицей: «Ирина С.»';

/**
 * Отзывы вымышленных людей о вымышленном деле демо. Полей для фото и оценки нет: у авторов нет лиц, а звезды
 * несуществующего дела не должны выглядеть как отзывы с настоящих площадок.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Отзыв', plural: 'Отзывы' },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'subject', 'createdAt'],
  },
  defaultSort: 'createdAt',
  fields: [
    {
      name: 'author',
      label: 'Автор',
      type: 'text',
      required: true,
      validate: validateReviewAuthor,
      admin: { description: 'Имя и первая буква фамилии: «Ирина С.»' },
    },
    { name: 'text', label: 'Текст', type: 'textarea', required: true },
    {
      name: 'subject',
      label: 'О чем отзыв',
      type: 'text',
      admin: { description: 'Услуга или врач: «Имплантация, Бережной А. О.»' },
    },
  ],
};
