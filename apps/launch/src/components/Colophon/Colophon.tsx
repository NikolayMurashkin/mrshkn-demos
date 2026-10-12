import { PRODUCT } from '@/consts';
import styles from './Colophon.module.scss';

/** Знак продукта над подписью демо; подпись «Демо-проект студии» ставит ядро. */
export const Colophon = () => (
  <p className={styles.colophon}>
    <span
      className={styles.wordmark}
      translate="no"
    >
      <span className={styles.path}>~/</span>
      {PRODUCT.wordmark}
    </span>
    <span>{PRODUCT.description}</span>
  </p>
);
