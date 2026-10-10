import type { CollectionConfig, TextFieldSingleValidation } from 'payload';
import { REVIEW_AUTHOR_HINTS, REVIEW_AUTHOR_PATTERNS } from '../consts';
import type { DemoLang } from '../types';

export const isReviewAuthor = (author: string, lang: DemoLang = 'ru') => REVIEW_AUTHOR_PATTERNS[lang].test(author);

/** Язык подписи — язык, на котором редактируется отзыв; без локалей в CMS демо — русский. */
const langOf = (locale: unknown): DemoLang => (locale === 'en' ? 'en' : 'ru');

const validateReviewAuthor: TextFieldSingleValidation = (value, options) => {
  const lang = langOf(options?.req?.locale);

  return isReviewAuthor(value ?? '', lang) || REVIEW_AUTHOR_HINTS[lang];
};

type ReviewsOptions = {
  /** Отзыв на каждом языке демо свой: текст, подпись и тема. Только у демо с локалями в CMS. */
  localized?: boolean;
};

/**
 * Отзывы вымышленных людей о вымышленном деле демо. Полей для фото и оценки нет: у авторов нет лиц, а звезды
 * несуществующего дела не должны выглядеть как отзывы с настоящих площадок.
 */
export const createReviews = ({ localized = false }: ReviewsOptions = {}): CollectionConfig => ({
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
      localized,
      validate: validateReviewAuthor,
      admin: {
        description: localized
          ? 'Имя и первая буква фамилии: «Ирина С.», на английском — «Emily R.»'
          : 'Имя и первая буква фамилии: «Ирина С.»',
      },
    },
    { name: 'text', label: 'Текст', type: 'textarea', required: true, localized },
    {
      name: 'subject',
      label: 'О чем отзыв',
      type: 'text',
      localized,
      admin: { description: 'Услуга или врач: «Имплантация, Бережной А. О.»' },
    },
  ],
});

export const Reviews = createReviews();
