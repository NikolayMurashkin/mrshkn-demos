'use client';

import { useState } from 'react';
import { CONSENT_COOKIE, CONSENT_MAX_AGE } from '../../consts';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang } from '../../types';
import styles from './CookieBanner.module.scss';

type CookieBannerProps = {
  policyHref: string;
  /** Сервер читает cookie и рендерит уведомление сразу, без вспышки после гидрации. */
  initiallyVisible: boolean;
  lang?: DemoLang;
};

export const CookieBanner = ({ policyHref, initiallyVisible, lang = 'ru' }: CookieBannerProps) => {
  const [visible, setVisible] = useState(initiallyVisible);

  if (!visible) {
    return null;
  }

  const texts = CORE_TEXTS[lang].cookie;

  const close = () => {
    document.cookie = `${CONSENT_COOKIE}=1; max-age=${CONSENT_MAX_AGE}; path=/; samesite=lax`;
    setVisible(false);
  };

  return (
    <section
      className={styles.banner}
      aria-label={texts.label}
    >
      <p className={styles.text}>
        {texts.text}
        <a href={policyHref}>{texts.link}</a>.
      </p>
      <button
        className={styles.button}
        type="button"
        onClick={close}
      >
        {texts.close}
      </button>
    </section>
  );
};
