'use client';

import { LOW_VISION_DEFAULTS, LOW_VISION_EVENT } from '../../consts';
import { applyLowVision } from '../../low-vision';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang, LowVisionEventDetail } from '../../types';
import styles from './LowVisionToggle.module.scss';

type LowVisionToggleProps = {
  lang?: DemoLang;
};

/**
 * Значок версии для слабовидящих в шапке. Включает режим по умолчанию сразу на открытой странице и сообщает
 * панели событием — без перезагрузки; в режиме переводит фокус в панель.
 */
export const LowVisionToggle = ({ lang = 'ru' }: LowVisionToggleProps) => {
  const texts = CORE_TEXTS[lang].lowVision;

  const enable = () => {
    const detail: LowVisionEventDetail = {};

    if (!document.documentElement.hasAttribute('data-low-vision')) {
      applyLowVision(LOW_VISION_DEFAULTS);
      detail.settings = LOW_VISION_DEFAULTS;
    }

    window.dispatchEvent(new CustomEvent(LOW_VISION_EVENT, { detail }));
  };

  return (
    <button
      className={styles.toggle}
      type="button"
      aria-label={texts.toggle}
      title={texts.toggle}
      data-low-vision-toggle
      onClick={enable}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
        <circle
          cx="12"
          cy="12"
          r="3.5"
        />
      </svg>
      <span className={styles.label}>{texts.toggleShort}</span>
    </button>
  );
};
