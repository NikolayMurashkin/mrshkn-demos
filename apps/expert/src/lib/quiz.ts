import { QUIZ_CRISIS, QUIZ_QUESTIONS, QUIZ_RESULTS } from '../consts';
import type { QuizAnswers, QuizResult } from '../types';

export { QUIZ_QUESTIONS, QUIZ_RESULTS };

const resultById = new Map(QUIZ_RESULTS.map((result) => [result.id, result]));

const resultOf = (id: string) => resultById.get(id) ?? null;

const isComplete = (answers: QuizAnswers) =>
  QUIZ_QUESTIONS.every(({ id, options }) => options.some((option) => option.id === answers[id]));

/**
 * Результат квиза «подходит ли вам» — только по полному набору известных ответов. Кризисный ответ важнее остального:
 * сначала срочная помощь, запись — вторым действием. Пара — парная сессия; недавнее или непонятное — знакомство;
 * давнее свое — индивидуальная работа.
 */
export const getQuizResult = (answers: QuizAnswers): QuizResult | null => {
  if (!isComplete(answers)) {
    return null;
  }

  if (QUIZ_QUESTIONS.some(({ id }) => answers[id] === QUIZ_CRISIS)) {
    return resultOf('urgent');
  }

  if (answers.who === 'couple') {
    return resultOf('couple');
  }

  if (answers.who === 'unsure' || answers.duration === 'weeks') {
    return resultOf('intro');
  }

  return resultOf('individual');
};
