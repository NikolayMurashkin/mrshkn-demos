'use client';

import { HONEYPOT_FIELD, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CONSENT_TEXTS, WAITLIST_ERRORS, WAITLIST_TEXTS } from '@/consts';
import type { WaitlistErrors, WaitlistFormStatus } from '@/types';
import { WAITLIST_ENDPOINT } from '@/waitlist/consts';
import { waitlistErrorKind } from '@/waitlist/errors';
import { isWaitlistEmail, normalizeEmail } from '@/waitlist/parse';
import styles from './WaitlistForm.module.scss';

/**
 * Форма списка ожидания по TextField DS: свои ошибки под полем (`aria-invalid` и `aria-describedby`), фокус — на
 * первое неверное поле. Без согласия и с неверной почтой запрос не уходит; после записи форму сменяет строка `[ok]`.
 */
export const WaitlistForm = () => {
  const id = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const [status, setStatus] = useState<WaitlistFormStatus>('idle');
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const focusNext = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (status === 'sent') {
      doneRef.current?.focus();
    }
  }, [status]);

  useEffect(() => {
    focusNext.current?.focus();
    focusNext.current = null;
  }, [errors]);

  /** Фокус — после отрисовки: чтение экрана застанет у поля уже `aria-invalid` и текст ошибки. */
  const show = (next: WaitlistErrors) => {
    focusNext.current = next.email ? emailRef.current : next.consent ? consentRef.current : null;
    setErrors(next);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get('email'));
    const consent = data.get('consent') === 'on';
    const invalid: WaitlistErrors = {
      ...(!isWaitlistEmail(email) && { email: WAITLIST_TEXTS.emailError }),
      ...(!consent && { consent: WAITLIST_TEXTS.consentError }),
    };

    if (invalid.email || invalid.consent) {
      show(invalid);

      return;
    }

    setErrors({});
    setStatus('sending');

    try {
      const response = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, consent, [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD) }),
      });

      if (response.ok) {
        setStatus('sent');

        return;
      }

      const body: unknown = await response.json().catch(() => null);
      const reason = body && typeof body === 'object' && 'reason' in body ? body.reason : undefined;

      setStatus('idle');
      show(WAITLIST_ERRORS[waitlistErrorKind(response.status, reason)]);
    } catch {
      setStatus('idle');
      show(WAITLIST_ERRORS.failed);
    }
  };

  if (status === 'sent') {
    return (
      <p
        ref={doneRef}
        className={styles.done}
        role="status"
        tabIndex={-1}
      >
        <span
          className={styles.mark}
          aria-hidden="true"
          translate="no"
        >
          {WAITLIST_TEXTS.sentMark}
        </span>{' '}
        {WAITLIST_TEXTS.sent}
      </p>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      noValidate
    >
      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor={`${id}-email`}
        >
          {WAITLIST_TEXTS.email}
        </label>
        <input
          ref={emailRef}
          className={styles.input}
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
        />
        {errors.email && (
          <p
            className={styles.error}
            id={`${id}-email-error`}
          >
            {errors.email}
          </p>
        )}
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
      <div className={styles.field}>
        <div className={styles.consent}>
          <input
            ref={consentRef}
            id={`${id}-consent`}
            name="consent"
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
          />
          <label htmlFor={`${id}-consent`}>
            {CONSENT_TEXTS.consent}
            <a href={POLICY_HREF}>{CONSENT_TEXTS.consentLink}</a>
          </label>
        </div>
        {errors.consent && (
          <p
            className={styles.error}
            id={`${id}-consent-error`}
          >
            {errors.consent}
          </p>
        )}
      </div>
      <button
        className={styles.submit}
        type="submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? WAITLIST_TEXTS.sending : WAITLIST_TEXTS.submit} <span aria-hidden="true">→</span>
      </button>
      <p
        className={styles.status}
        role="status"
      >
        {errors.form}
      </p>
    </form>
  );
};
