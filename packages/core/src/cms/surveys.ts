import type { CollectionConfig, Field } from 'payload';
import { SURVEY_RATING_MAX, SURVEY_RATING_MIN } from '../consts';

const rating = (name: string, label: string, required = true): Field => ({
  name,
  label,
  type: 'number',
  required,
  min: SURVEY_RATING_MIN,
  max: SURVEY_RATING_MAX,
  admin: { step: 1 },
});

/**
 * Анкеты оценки качества услуг: пишет только обработчик анкеты через локальный API, через REST и админку их не
 * создать и не поправить; читает только вошедший. Имени и контакта в схеме нет — анкета анонимная.
 */
export const QualitySurveys: CollectionConfig = {
  slug: 'quality-surveys',
  labels: { singular: 'Анкета оценки качества', plural: 'Анкеты оценки качества' },
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['createdAt', 'satisfaction', 'comment'],
  },
  access: {
    create: () => false,
    update: () => false,
  },
  defaultSort: '-createdAt',
  fields: [
    rating('information', 'Легко найти сведения'),
    rating('comfort', 'Удобство и порядок'),
    rating('accessibility', 'Доступность для людей с инвалидностью', false),
    rating('courtesy', 'Вежливость сотрудников'),
    rating('satisfaction', 'Общая удовлетворенность'),
    { name: 'comment', label: 'Комментарий', type: 'textarea' },
    { name: 'demo', label: 'Демо', type: 'text', required: true },
  ],
};
