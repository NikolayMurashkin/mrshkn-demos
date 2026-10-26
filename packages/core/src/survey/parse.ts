import { COMMENT_MAX_LENGTH, HONEYPOT_FIELD, SURVEY_RATING_MAX, SURVEY_RATING_MIN } from '../consts';
import type { Survey, SurveyContext, SurveyParseResult, SurveyQuestionName } from '../types';

export type { Survey, SurveyContext, SurveyParseResult, SurveyQuestionName, SurveyRejection } from '../types';

/** Вопросы анкеты, без ответа на которые она не принимается. */
export const SURVEY_REQUIRED = [
  'information',
  'comfort',
  'courtesy',
  'satisfaction',
] as const satisfies readonly SurveyQuestionName[];

/** Обязателен ли вопрос: форма демо берет ответ отсюда, а не из своего списка. */
export const isSurveyRequired = (name: SurveyQuestionName) =>
  (SURVEY_REQUIRED as readonly SurveyQuestionName[]).includes(name);

const isRating = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= SURVEY_RATING_MIN && value <= SURVEY_RATING_MAX;

/**
 * Разбор анкеты: из запроса берутся только оценки и комментарий — имя, контакт и прочие поля отбрасываются.
 * Приманка проверяется первой: бот без оценок получает тот же ответ, что бот с оценками.
 */
export const parseSurvey = (input: unknown, context: SurveyContext): SurveyParseResult => {
  if (!input || typeof input !== 'object') {
    return { ok: false, reason: 'ratings' };
  }

  const data = input as Record<string, unknown>;
  const trap = data[HONEYPOT_FIELD];

  if (typeof trap === 'string' && trap.trim()) {
    return { ok: false, reason: 'honeypot' };
  }

  const ratings = {} as Pick<Survey, (typeof SURVEY_REQUIRED)[number]>;

  for (const key of SURVEY_REQUIRED) {
    const value = data[key];

    if (!isRating(value)) {
      return { ok: false, reason: 'ratings' };
    }

    ratings[key] = value;
  }

  const { accessibility } = data;
  const skipped = accessibility === undefined || accessibility === null;

  if (!skipped && !isRating(accessibility)) {
    return { ok: false, reason: 'ratings' };
  }

  const comment = typeof data.comment === 'string' ? data.comment.trim().slice(0, COMMENT_MAX_LENGTH) : '';
  const survey: Survey = {
    ...ratings,
    ...(!skipped && { accessibility }),
    ...(comment && { comment }),
    demo: context.demo,
  };

  return { ok: true, survey };
};
