'use client';

import { POSTER } from '../../consts';
import styles from './PrintButton.module.scss';

/** Печать плаката из браузера; в печать сама кнопка не попадает. */
export const PrintButton = () => (
  <button
    className={styles.button}
    type="button"
    onClick={() => window.print()}
  >
    {POSTER.print}
  </button>
);
