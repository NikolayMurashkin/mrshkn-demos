'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { QUIZ_PAGE } from '@/consts';
import { getQuizResult, QUIZ_QUESTIONS } from '@/lib/quiz';
import type { QuizAnswers } from '@/types';
import styles from './Quiz.module.scss';

/**
 * Квиз «подходит ли вам»: по вопросу на экран, ответ сразу ведет дальше; после последнего — вывод и запись.
 * Кризисный вывод без буквицы: первым — телефон 112, запись на знакомство — контурной кнопкой ниже.
 */
export const Quiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const total = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[step];
  const result = step >= total ? getQuizResult(answers) : null;

  useEffect(() => {
    if (moved.current) {
      heading.current?.focus();
    }
  }, [step]);

  const go = (next: number) => {
    moved.current = true;
    setStep(next);
  };

  const answer = (questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    go(step + 1);
  };

  if (result) {
    return (
      <section
        className={styles.layout}
        aria-labelledby="page-title"
      >
        <div className={styles.result}>
          <h1
            ref={heading}
            className={styles.title}
            id="page-title"
            tabIndex={-1}
          >
            {result.title}
          </h1>
          {result.urgent && result.phone && (
            <a
              className={styles.phone}
              href={`tel:${result.phone}`}
            >
              {result.phone}
            </a>
          )}
          <p className={result.urgent ? styles.lead : `${styles.lead} ${styles.dropcap}`}>{result.text}</p>
          <div className={styles.actions}>
            <Link
              className={result.urgent ? styles.secondary : styles.primary}
              href={result.href}
              prefetch={false}
            >
              {result.cta}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <section
      className={styles.layout}
      aria-labelledby="page-title"
    >
      <div className={styles.aside}>
        <span
          className={styles.count}
          aria-hidden="true"
        >
          {step + 1}
          <small>/{total}</small>
        </span>
        <p className={styles.kicker}>{QUIZ_PAGE.step(step + 1, total)}</p>
      </div>
      <div className={styles.main}>
        <h1
          className={styles.title}
          id="page-title"
        >
          {QUIZ_PAGE.title}
        </h1>
        <p className={styles.lead}>{QUIZ_PAGE.lead}</p>
        <ol
          className={styles.progress}
          aria-hidden="true"
        >
          {QUIZ_QUESTIONS.map(({ id }, index) => (
            <li
              key={id}
              data-state={index < step ? 'done' : index === step ? 'current' : 'todo'}
            />
          ))}
        </ol>
        <div className={styles.step}>
          <h2
            ref={heading}
            className={styles.question}
            id="quiz-question"
            tabIndex={-1}
          >
            {question.text}
          </h2>
          <div className={styles.choices}>
            {question.options.map((option) => (
              <button
                key={option.id}
                className={styles.choice}
                type="button"
                aria-pressed={answers[question.id] === option.id}
                onClick={() => answer(question.id, option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.secondary}
            type="button"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            {QUIZ_PAGE.back}
          </button>
          <button
            className={styles.primary}
            type="button"
            disabled={!answers[question.id]}
            onClick={() => go(step + 1)}
          >
            {QUIZ_PAGE.next}
          </button>
        </div>
      </div>
    </section>
  );
};
