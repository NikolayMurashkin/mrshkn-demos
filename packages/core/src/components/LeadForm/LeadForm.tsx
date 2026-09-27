'use client';

import { useId, useState, type FormEvent } from 'react';
import { COMMENT_MAX_LENGTH, CONTACT_MAX_LENGTH, HONEYPOT_FIELD, LEAD_ENDPOINT, NAME_MAX_LENGTH } from '../../consts';
import type { LeadFormStatus } from '../../types';
import { STATUS_TEXT } from './consts';
import styles from './LeadForm.module.scss';

type LeadFormProps = {
  policyHref: string;
  endpoint?: string;
};

export const LeadForm = ({ policyHref, endpoint = LEAD_ENDPOINT }: LeadFormProps) => {
  const id = useId();
  const [status, setStatus] = useState<LeadFormStatus>('idle');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    setStatus('sending');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          contact: data.get('contact'),
          comment: data.get('comment'),
          consent: data.get('consent') === 'on',
          [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD),
        }),
      });

      if (response.status === 422) {
        setStatus('invalid');

        return;
      }

      setStatus(response.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent') {
    return (
      <p
        className={styles.done}
        role="status"
      >
        {STATUS_TEXT.sent}
      </p>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={submit}
    >
      <label
        className={styles.label}
        htmlFor={`${id}-name`}
      >
        Имя
      </label>
      <input
        className={styles.input}
        id={`${id}-name`}
        name="name"
        autoComplete="name"
        maxLength={NAME_MAX_LENGTH}
        required
      />
      <label
        className={styles.label}
        htmlFor={`${id}-contact`}
      >
        Телефон или ник в&nbsp;Telegram
      </label>
      <input
        className={styles.input}
        id={`${id}-contact`}
        name="contact"
        autoComplete="tel"
        maxLength={CONTACT_MAX_LENGTH}
        required
      />
      <label
        className={styles.label}
        htmlFor={`${id}-comment`}
      >
        Комментарий
      </label>
      <textarea
        className={styles.input}
        id={`${id}-comment`}
        name="comment"
        rows={4}
        maxLength={COMMENT_MAX_LENGTH}
      />
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
      <div className={styles.consent}>
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          required
        />
        <label htmlFor={`${id}-consent`}>
          Соглашаюсь на&nbsp;обработку персональных данных по&nbsp;<a href={policyHref}>политике</a>
        </label>
      </div>
      <button
        className={styles.submit}
        type="submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
      </button>
      <p
        className={styles.status}
        role="status"
      >
        {status === 'invalid' || status === 'failed' ? STATUS_TEXT[status] : ''}
      </p>
    </form>
  );
};
