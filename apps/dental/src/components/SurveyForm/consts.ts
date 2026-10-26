import { SURVEY_RATING_MAX, SURVEY_RATING_MIN } from '@mrshkn/demo-core/consts';

/** Шкала каждого вопроса анкеты: 1, 2, 3, 4, 5. */
export const RATINGS = Array.from(
  { length: SURVEY_RATING_MAX - SURVEY_RATING_MIN + 1 },
  (_, index) => SURVEY_RATING_MIN + index,
);
