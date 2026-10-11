import { existsSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

type QuizQuestion = { id: string; text: string; options: { id: string; text: string }[] };

type QuizResult = { id: string; title: string; text: string; href: string; urgent?: boolean; phone?: string };

type Answers = Record<string, string>;

const EXPERT_SRC = path.resolve(import.meta.dirname, '../../apps/expert/src');

/** Модуль демо «Эксперт»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importExpert = async <T>(relative: string): Promise<T> => {
  const file = path.join(EXPERT_SRC, relative);

  expect(existsSync(file), `нет apps/expert/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const CRISIS = 'crisis';

let QUIZ_QUESTIONS: QuizQuestion[];
let QUIZ_RESULTS: QuizResult[];
let getQuizResult: (answers: Answers) => QuizResult | null;
let FORMATS: { slug: string }[];

beforeAll(async () => {
  ({ QUIZ_QUESTIONS, QUIZ_RESULTS, getQuizResult } = await importExpert<{
    QUIZ_QUESTIONS: QuizQuestion[];
    QUIZ_RESULTS: QuizResult[];
    getQuizResult: typeof getQuizResult;
  }>('lib/quiz.ts'));
  ({ FORMATS } = await importExpert<{ FORMATS: { slug: string }[] }>('cms/seed/data.ts'));
});

/** Все полные комбинации ответов: декартово произведение опций всех вопросов. */
const allAnswers = () =>
  QUIZ_QUESTIONS.reduce<Answers[]>(
    (combos, question) =>
      combos.flatMap((answers) => question.options.map(({ id }) => ({ ...answers, [question.id]: id }))),
    [{}],
  );

const isCrisis = (answers: Answers) => Object.values(answers).includes(CRISIS);

const bookingHrefs = () => ['/booking', ...FORMATS.map(({ slug }) => `/booking?format=${slug}`)];

const describeAnswers = (answers: Answers) => JSON.stringify(answers);

describe('квиз «подходит ли вам»', () => {
  it('Q1: на каждую полную комбинацию ответов — результат с текстом и ссылкой на запись', () => {
    const combos = allAnswers();

    expect(QUIZ_QUESTIONS.length).toBeGreaterThan(0);
    expect(combos.length).toBeGreaterThan(1);

    for (const answers of combos) {
      const result = getQuizResult(answers);

      expect(result, describeAnswers(answers)).not.toBeNull();
      expect(result?.title.trim(), describeAnswers(answers)).not.toBe('');
      expect(result?.text.trim(), describeAnswers(answers)).not.toBe('');
      expect(bookingHrefs(), describeAnswers(answers)).toContain(result?.href);
    }
  });

  it('Q2: каждый результат квиза достижим, результатов не меньше трех, id не повторяются', () => {
    const reached = new Set(allAnswers().map((answers) => getQuizResult(answers)?.id));
    const ids = QUIZ_RESULTS.map(({ id }) => id);

    expect(QUIZ_RESULTS.length).toBeGreaterThanOrEqual(3);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...reached].sort()).toEqual([...ids].sort());
  });

  it('Q3: результат зависит от ответов — пара ведет на парную сессию, «для себя» — на знакомство или индивидуальную', () => {
    const who = QUIZ_QUESTIONS.find(({ id }) => id === 'who');

    expect(who?.options.map(({ id }) => id)).toEqual(expect.arrayContaining(['couple', 'self']));

    const calm = allAnswers().filter((answers) => !isCrisis(answers));
    const couple = calm.filter((answers) => answers.who === 'couple');
    const self = calm.filter((answers) => answers.who === 'self');

    expect(couple.length).toBeGreaterThan(0);
    expect(self.length).toBeGreaterThan(0);

    for (const answers of couple) {
      expect(getQuizResult(answers)?.href, describeAnswers(answers)).toBe('/booking?format=couple');
    }

    for (const answers of self) {
      expect(['/booking?format=intro', '/booking?format=individual'], describeAnswers(answers)).toContain(
        getQuizResult(answers)?.href,
      );
    }
  });

  it('Q4: кризисный ответ при любых остальных дает срочный результат с телефоном доверия и ссылкой на запись', () => {
    const combos = allAnswers();
    const crisis = combos.filter(isCrisis);
    const calm = combos.filter((answers) => !isCrisis(answers));

    expect(QUIZ_QUESTIONS.some(({ options }) => options.some(({ id }) => id === CRISIS))).toBe(true);
    expect(crisis.length).toBeGreaterThan(0);
    expect(calm.length).toBeGreaterThan(0);

    for (const answers of crisis) {
      const result = getQuizResult(answers);

      expect(result?.urgent, describeAnswers(answers)).toBe(true);
      expect(result?.phone?.trim() ?? '', describeAnswers(answers)).not.toBe('');
      expect(bookingHrefs(), describeAnswers(answers)).toContain(result?.href);
    }

    for (const answers of calm) {
      expect(getQuizResult(answers)?.urgent, describeAnswers(answers)).not.toBe(true);
    }
  });

  it('Q5: неполные ответы, несуществующая опция и пустой объект — без результата', () => {
    const combos = allAnswers();
    const samples = [combos.find((answers) => !isCrisis(answers)), combos.find(isCrisis)].filter(
      (answers): answers is Answers => Boolean(answers),
    );

    expect(getQuizResult({})).toBeNull();
    expect(samples.length).toBeGreaterThan(0);

    for (const answers of samples) {
      for (const question of QUIZ_QUESTIONS) {
        const incomplete = { ...answers };

        delete incomplete[question.id];

        expect(getQuizResult(incomplete), `без ответа на ${question.id}: ${describeAnswers(answers)}`).toBeNull();
        expect(
          getQuizResult({ ...answers, [question.id]: 'no-such-option' }),
          `чужая опция в ${question.id}: ${describeAnswers(answers)}`,
        ).toBeNull();
      }
    }
  });
});
