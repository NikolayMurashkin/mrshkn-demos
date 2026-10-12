import { BRAND } from '../../consts';
import styles from './Wordmark.module.scss';

type WordmarkProps = {
  className?: string;
};

/** Название заведения на желтой метке — знак Pop; имя не переводится. */
export const Wordmark = ({ className }: WordmarkProps) => (
  <span
    className={className ? `${styles.wordmark} ${className}` : styles.wordmark}
    translate="no"
  >
    {BRAND.name}
  </span>
);
