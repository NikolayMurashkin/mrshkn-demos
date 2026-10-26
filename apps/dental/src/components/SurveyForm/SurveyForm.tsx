'use client';

import { COMMENT_MAX_LENGTH, HONEYPOT_FIELD, SURVEY_ENDPOINT } from '@mrshkn/demo-core/consts';
import { isSurveyRequired } from '@mrshkn/demo-core/survey/parse';
import { CORE_TEXTS } from '@mrshkn/demo-core/texts';
import type { SurveyQuestionName } from '@mrshkn/demo-core/types';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { SURVEY } from '@/consts';
import type { SurveyStatus } from '@/types';
import { Arrow } from '../Arrow';
import { RATINGS } from './consts';
import styles from './SurveyForm.module.scss';

const ratingOf = (value: FormDataEntryValue | null) => (value === null ? null : Number(value));

const statusOf = (response: Response): SurveyStatus => {
  if (response.ok) {
    return 'sent';
  }

  if (response.status === 422) {
    return 'ratings';
  }

  return response.status === 429 ? 'rate' : 'failed';
};

/**
 * Анкета без имени и контакта: пять вопросов по шкале от 1 до 5 и необязательный комментарий. Пропущенный
 * обязательный вопрос показывает ошибку у себя; ошибка снимается выбором оценки.
 */
export const SurveyForm = () => {
  const id = useId();
  const [status, setStatus] = useState<SurveyStatus>('idle');
  const [missing, setMissing] = useState<SurveyQuestionName[]>([]);
  const done = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === 'sent') {
      done.current?.focus();
    }
  }, [status]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const skipped = SURVEY.questions
      .filter(({ name }) => isSurveyRequired(name) && data.get(name) === null)
      .map(({ name }) => name);

    setMissing(skipped);

    if (skipped.length > 0) {
      setStatus('idle');
      form.querySelector<HTMLInputElement>(`input[name="${skipped[0]}"]`)?.focus();

      return;
    }

    setStatus('sending');

    try {
      const response = await fetch(SURVEY_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(SURVEY.questions.map(({ name }) => [name, ratingOf(data.get(name))])),
          comment: data.get('comment'),
          [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD),
        }),
      });

      setStatus(statusOf(response));
    } catch {
      setStatus('failed');
    }
  };

  const answer = (name: string) => setMissing((names) => names.filter((missed) => missed !== name));

  if (status === 'sent') {
    return (
      <p
        ref={done}
        className={styles.done}
        role="status"
        tabIndex={-1}
      >
        {SURVEY.sent}
      </p>
    );
  }

  const error = status === 'ratings' || status === 'rate' || status === 'failed' ? SURVEY.errors[status] : '';
  const sending = status === 'sending';

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      noValidate
    >
      {SURVEY.questions.map(({ name, text, note }) => {
        const invalid = missing.includes(name);
        const describedBy = [
          `${id}-${name}-scale`,
          note && `${id}-${name}-note`,
          invalid && `${id}-${name}-error`,
        ].filter(Boolean);

        return (
          <fieldset
            key={name}
            className={styles.question}
            aria-describedby={describedBy.join(' ')}
            aria-invalid={invalid || undefined}
          >
            <legend className={styles.legend}>{text}</legend>
            <div className={styles.body}>
              {note && (
                <p
                  className={styles.note}
                  id={`${id}-${name}-note`}
                >
                  {note}
                </p>
              )}
              <div className={styles.scale}>
                {RATINGS.map((rating) => (
                  <label
                    key={rating}
                    className={styles.option}
                  >
                    <input
                      className={styles.radio}
                      type="radio"
                      name={name}
                      value={rating}
                      required={isSurveyRequired(name)}
                      onChange={() => answer(name)}
                    />
                    {rating}
                  </label>
                ))}
              </div>
              <p
                className={styles.edges}
                id={`${id}-${name}-scale`}
              >
                <span>{SURVEY.scaleMin}</span> <span>{SURVEY.scaleMax}</span>
              </p>
              {invalid && (
                <p
                  className={styles.error}
                  id={`${id}-${name}-error`}
                >
                  {SURVEY.errors.ratings}
                </p>
              )}
            </div>
          </fieldset>
        );
      })}
      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor={`${id}-comment`}
        >
          {SURVEY.comment}
        </label>
        <p
          className={styles.note}
          id={`${id}-comment-hint`}
        >
          {SURVEY.commentHint}
        </p>
        <textarea
          className={styles.input}
          id={`${id}-comment`}
          name="comment"
          rows={4}
          maxLength={COMMENT_MAX_LENGTH}
          autoComplete="off"
          aria-describedby={`${id}-comment-hint`}
        />
      </div>
      <div
        className={styles.trap}
        aria-hidden="true"
      >
        <input
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <button
        className={styles.submit}
        type="submit"
        disabled={sending}
        aria-busy={sending}
      >
        {sending ? CORE_TEXTS.ru.leadForm.sending : SURVEY.submit}
        <Arrow />
      </button>
      <p
        className={styles.error}
        role="alert"
      >
        {error}
      </p>
    </form>
  );
};
