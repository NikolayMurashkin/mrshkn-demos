import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical';
import { validatePhotoKey } from '@mrshkn/demo-core/photo';
import type { CollectionConfig } from 'payload';
import { PHOTO_KEYS } from '../../assets/photos/keys';
import { validatePageSlug } from '../validate';

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Статья', plural: 'Статьи' },
  defaultSort: '-publishedAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt'],
  },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Адрес страницы',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validatePageSlug,
      admin: { description: 'Статья откроется по адресу /articles/<адрес>' },
    },
    { name: 'publishedAt', label: 'Дата', type: 'date', required: true, index: true },
    { name: 'lead', label: 'Лид', type: 'textarea', required: true },
    {
      name: 'photo',
      label: 'Фото (ключ кадра)',
      type: 'text',
      validate: validatePhotoKey(PHOTO_KEYS),
      admin: { description: 'Ключ из src/assets/photos/index.ts приложения; пусто — без фото' },
    },
    {
      name: 'content',
      label: 'Текст',
      type: 'richText',
      required: true,
      admin: { description: 'Заголовки второго уровня попадают в оглавление статьи' },
      editor: lexicalEditor({
        features: [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          BoldFeature(),
          ItalicFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: ['articles'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
};
