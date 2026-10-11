'use client';

import {
  COMMENT_MAX_LENGTH,
  CONTACT_INPUT,
  CONTACT_MAX_LENGTH,
  HONEYPOT_FIELD,
  NAME_MAX_LENGTH,
} from '@mrshkn/demo-core/consts';
import { CORE_TEXTS } from '@mrshkn/demo-core/texts';
import { useId, useState, type FormEvent } from 'react';
import { BOOKING_PAGE, BOOKING_REQUIRED, FORMATS_PAGE } from '@/consts';
import { BOOKING_ENDPOINT, WHEN_MAX_LENGTH } from '@/payment/consts';
import type { BookingField } from '@/types';
import type { BookingFormFormat, BookingFormStatus } from './types';
import styles from './BookingForm.module.scss';

type BookingFormProps = {
  formats: BookingFormFormat[];
  /** Формат из `?format=` — выбран сразу. */
  selected?: string;
  policyHref: string;
};

const isMissing = (data: FormData, field: BookingField) =>
  field === 'consent' ? data.get(field) !== 'on' : !String(data.get(field) ?? '').trim();

/**
 * Запись: формат, контакты, «когда удобно», согласие → обработчик создает платеж → переход на оплату ЮKassa.
 * Обязательные поля проверяются до отправки: ошибка — под своим полем, фокус — на первое незаполненное.
 */
export const BookingForm = ({ formats, selected, policyHref }: BookingFormProps) => {
  const id = useId();
  const [status, setStatus] = useState<BookingFormStatus>('idle');
  const [invalid, setInvalid] = useState<BookingField[]>([]);
  const consent = CORE_TEXTS.ru.leadForm;
  const errorId = (field: BookingField) => `${id}-${field}-error`;
  const fieldProps = (field: BookingField, describedBy?: string) => {
    const hasError = invalid.includes(field);
    const ids = [describedBy, hasError ? errorId(field) : undefined].filter(Boolean).join(' ');

    return { 'aria-invalid': hasError || undefined, 'aria-describedby': ids || undefined };
  };
  const errorOf = (field: BookingField) =>
    invalid.includes(field) && (
      <span
        className={styles.error}
        id={errorId(field)}
      >
        {BOOKING_PAGE.errors[field]}
      </span>
    );

  const clearError = (event: FormEvent<HTMLFormElement>) => {
    const { name } = event.target as HTMLInputElement;

    setInvalid((current) => current.filter((field) => field !== name));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const missing = BOOKING_REQUIRED.filter((field) => isMissing(data, field));

    setInvalid(missing);

    if (missing.length) {
      const first = form.elements.namedItem(missing[0]);
      const target = first instanceof RadioNodeList ? first[0] : first;

      setStatus('idle');

      if (target instanceof HTMLElement) {
        target.focus();
      }

      return;
    }

    setStatus('sending');

    try {
      const response = await fetch(BOOKING_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          format: data.get('format'),
          name: data.get('name'),
          contact: data.get('contact'),
          when: data.get('when'),
          comment: data.get('comment'),
          consent: data.get('consent') === 'on',
          [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { confirmationUrl?: string };

      if (response.ok && body.confirmationUrl) {
        window.location.assign(body.confirmationUrl);

        return;
      }

      setStatus(response.status === 422 ? 'invalid' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <form
      className={styles.form}
      noValidate
      onChange={clearError}
      onSubmit={submit}
    >
      <fieldset className={styles.formats}>
        <legend className={styles.label}>{BOOKING_PAGE.legend}</legend>
        {formats.map((format) => (
          <label
            key={format.slug}
            className={styles.format}
          >
            <input
              type="radio"
              name="format"
              value={format.slug}
              defaultChecked={format.slug === selected}
              required
              {...fieldProps('format')}
            />
            <span className={styles.formatName}>{format.title}</span>
            <span className={styles.formatMeta}>{format.meta}</span>
            <span className={styles.formatPrice}>{format.price}</span>
          </label>
        ))}
        {errorOf('format')}
        <p className={styles.note}>{FORMATS_PAGE.rules}</p>
      </fieldset>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor={`${id}-name`}
          >
            {BOOKING_PAGE.name}
          </label>
          <input
            className={styles.input}
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            maxLength={NAME_MAX_LENGTH}
            required
            {...fieldProps('name')}
          />
          {errorOf('name')}
        </div>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor={`${id}-contact`}
          >
            {BOOKING_PAGE.contact}
          </label>
          <input
            className={styles.input}
            id={`${id}-contact`}
            name="contact"
            autoComplete={CONTACT_INPUT.ru.autoComplete}
            spellCheck={CONTACT_INPUT.ru.spellCheck}
            maxLength={CONTACT_MAX_LENGTH}
            required
            {...fieldProps('contact')}
          />
          {errorOf('contact')}
        </div>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor={`${id}-when`}
          >
            {BOOKING_PAGE.when}
          </label>
          <input
            className={styles.input}
            id={`${id}-when`}
            name="when"
            autoComplete="off"
            maxLength={WHEN_MAX_LENGTH}
            required
            {...fieldProps('when', `${id}-when-hint`)}
          />
          <span
            className={styles.hint}
            id={`${id}-when-hint`}
          >
            {BOOKING_PAGE.whenHint}
          </span>
          {errorOf('when')}
        </div>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor={`${id}-comment`}
          >
            {BOOKING_PAGE.comment} <span className={styles.optional}>{BOOKING_PAGE.optional}</span>
          </label>
          <textarea
            className={styles.input}
            id={`${id}-comment`}
            name="comment"
            autoComplete="off"
            rows={3}
            maxLength={COMMENT_MAX_LENGTH}
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
        <div className={styles.field}>
          <label className={styles.consent}>
            <input
              name="consent"
              type="checkbox"
              required
              {...fieldProps('consent')}
            />
            <span>
              {consent.consent}
              <a href={policyHref}>{consent.consentLink}</a>
            </span>
          </label>
          {errorOf('consent')}
        </div>
      </div>
      <div className={styles.submit}>
        <button
          className={styles.button}
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? BOOKING_PAGE.sending : BOOKING_PAGE.submit}
        </button>
        <p className={styles.note}>{BOOKING_PAGE.note}</p>
        <p
          className={styles.status}
          role="status"
        >
          {status === 'invalid' || status === 'failed' ? BOOKING_PAGE[status] : ''}
        </p>
      </div>
    </form>
  );
};
