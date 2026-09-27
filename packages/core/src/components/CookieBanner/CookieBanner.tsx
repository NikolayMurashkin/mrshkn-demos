'use client';

import { useState } from 'react';
import { CONSENT_COOKIE, CONSENT_MAX_AGE } from '../../consts';
import styles from './CookieBanner.module.scss';

type CookieBannerProps = {
  policyHref: string;
  /** Сервер читает cookie и рендерит уведомление сразу, без вспышки после гидрации. */
  initiallyVisible: boolean;
};

export const CookieBanner = ({ policyHref, initiallyVisible }: CookieBannerProps) => {
  const [visible, setVisible] = useState(initiallyVisible);

  if (!visible) {
    return null;
  }

  const close = () => {
    document.cookie = `${CONSENT_COOKIE}=1; max-age=${CONSENT_MAX_AGE}; path=/; samesite=lax`;
    setVisible(false);
  };

  return (
    <section
      className={styles.banner}
      aria-label="Уведомление о cookie"
    >
      <p className={styles.text}>
        Мы используем cookie, чтобы сайт работал. Подробнее&nbsp;— в&nbsp;
        <a href={policyHref}>политике обработки данных</a>.
      </p>
      <button
        className={styles.button}
        type="button"
        onClick={close}
      >
        Понятно
      </button>
    </section>
  );
};
