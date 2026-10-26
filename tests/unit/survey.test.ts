import { HONEYPOT_FIELD } from '@mrshkn/demo-core/consts';
import { createRateLimiter } from '@mrshkn/demo-core/lead/rate-limit';
import { parseSurvey } from '@mrshkn/demo-core/survey/parse';
import { afterEach, describe, expect, it, vi } from 'vitest';

const CONTEXT = { demo: 'dental' };

const MINUTE = 60 * 1000;

/** Лимит анкеты из контракта: окно — те самые «около 10 минут» политики. */
const SURVEY_LIMIT = { limit: 10, windowMs: 10 * MINUTE };

type RateLimiter = ReturnType<typeof createRateLimiter>;

/** Число хранимых адресов — метод `size()` из контракта; пока его нет, тест падает на assert, а не на TypeError. */
const sizeOf = (limiter: RateLimiter) => {
  const sized = limiter as RateLimiter & { size?: () => number };

  expect(typeof sized.size, 'метод size() лимитера').toBe('function');

  return sized.size?.();
};

/** Таймеры, которые держат процесс: таймер чистки с `unref()` сюда не попадает. */
const refTimers = () => process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length;

const valid = { information: 5, comfort: 4, accessibility: 3, courtesy: 2, satisfaction: 1 };

const REQUIRED = ['information', 'comfort', 'courtesy', 'satisfaction'] as const;

const surveyOf = (input: unknown) => {
  const result = parseSurvey(input, CONTEXT);

  expect(result.ok, 'анкета принята').toBe(true);

  return result.ok ? result.survey : undefined;
};

const without = <T extends object>(source: T, key: keyof T) => {
  const copy = { ...source };

  delete copy[key];

  return copy;
};

describe('разбор анкеты оценки качества — parseSurvey', () => {
  it('P1: пять верных оценок — анкета с пометкой демо, без комментария', () => {
    expect(parseSurvey(valid, CONTEXT)).toEqual({ ok: true, survey: { ...valid, demo: 'dental' } });
    expect(Object.keys(surveyOf(valid) ?? {}), 'ключа comment нет').not.toContain('comment');
  });

  it.each([[0], [6], [4.5], ['5'], [null], [undefined], [Number.NaN]])(
    'P2: оценка «удобство» = %s — отказ по оценкам',
    (value) => {
      expect(parseSurvey({ ...valid, comfort: value }, CONTEXT)).toEqual({ ok: false, reason: 'ratings' });
    },
  );

  it.each(REQUIRED)('P3: без обязательной оценки %s — отказ по оценкам', (key) => {
    expect(parseSurvey(without(valid, key), CONTEXT)).toEqual({ ok: false, reason: 'ratings' });
  });

  it('P3a: без оценки доступности или с null — анкета принята, ключа accessibility нет', () => {
    const rest = without(valid, 'accessibility');

    for (const input of [rest, { ...rest, accessibility: null }]) {
      const survey = surveyOf(input);

      expect(survey).toEqual({ ...rest, demo: 'dental' });
      expect(Object.keys(survey ?? {})).not.toContain('accessibility');
    }
  });

  it.each([[0], [6], [4.5], ['3']])('P3b: оценка доступности = %s — отказ по оценкам', (value) => {
    expect(parseSurvey({ ...valid, accessibility: value }, CONTEXT)).toEqual({ ok: false, reason: 'ratings' });
  });

  it('P4: границы 1 и 5 входят в шкалу', () => {
    for (const rating of [1, 5]) {
      const ratings = {
        information: rating,
        comfort: rating,
        accessibility: rating,
        courtesy: rating,
        satisfaction: rating,
      };

      expect(parseSurvey(ratings, CONTEXT), `все оценки ${rating}`).toEqual({
        ok: true,
        survey: { ...ratings, demo: 'dental' },
      });
    }
  });

  it('P5: комментарий обрезается по краям и до 2000 знаков, пустой — без поля', () => {
    expect(surveyOf({ ...valid, comment: '  Все хорошо  ' })?.comment).toBe('Все хорошо');
    expect(surveyOf({ ...valid, comment: 'а'.repeat(2500) })?.comment).toBe('а'.repeat(2000));

    const blank = surveyOf({ ...valid, comment: '   ' });

    expect(blank).toEqual({ ...valid, demo: 'dental' });
    expect(Object.keys(blank ?? {})).not.toContain('comment');
  });

  it('P6: заполненная приманка — отказ «приманка», даже без оценок: она проверяется первой', () => {
    expect(parseSurvey({ ...valid, [HONEYPOT_FIELD]: 'x' }, CONTEXT)).toEqual({ ok: false, reason: 'honeypot' });
    expect(parseSurvey({ [HONEYPOT_FIELD]: 'x' }, CONTEXT)).toEqual({ ok: false, reason: 'honeypot' });
  });

  it('P7: не объект — отказ по оценкам без исключения', () => {
    expect(parseSurvey(null, CONTEXT)).toEqual({ ok: false, reason: 'ratings' });
    expect(parseSurvey('строка', CONTEXT)).toEqual({ ok: false, reason: 'ratings' });
  });

  it('P8: имя и контакт из запроса в анкету не попадают', () => {
    const survey = surveyOf({ ...valid, name: 'Иван', contact: '+7 900 000-00-00' });

    expect(survey).toEqual({ ...valid, demo: 'dental' });
    expect(Object.keys(survey ?? {}).sort()).toEqual([...Object.keys(valid), 'demo'].sort());
  });
});

describe('лимитер ядра: адрес хранится не дольше окна', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('RL1: без новых обращений адрес стирается таймером — через 11 минут его нет', () => {
    vi.useFakeTimers();

    const limiter = createRateLimiter(SURVEY_LIMIT);

    limiter.allow('198.51.100.1');
    expect(sizeOf(limiter), 'адрес запомнен').toBe(1);

    vi.advanceTimersByTime(11 * MINUTE);

    expect(sizeOf(limiter), 'адрес стерт без единого вызова allow').toBe(0);
  });

  it('RL2: каждый вызов выбрасывает адреса старше окна; таймер чистки не держит процесс', () => {
    const before = refTimers();
    const limiter = createRateLimiter(SURVEY_LIMIT);
    const start = Date.now();

    limiter.allow('a', start);
    limiter.allow('b', start + 11 * MINUTE);

    expect(refTimers(), 'таймер чистки — с unref()').toBe(before);
    expect(sizeOf(limiter), 'адрес «a» выброшен вызовом для «b»').toBe(1);
  });
});
