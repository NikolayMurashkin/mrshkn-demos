import { STAR_PATH } from '../../consts';
import styles from './Star.module.scss';

type StarProps = {
  className?: string;
  size?: number;
};

/** Звезда-стикер DS Pop: заливка — цвет текста родителя, контур — ink. Декор, скринридеру не виден. */
export const Star = ({ className, size = 24 }: StarProps) => (
  <svg
    className={className ? `${styles.star} ${className}` : styles.star}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    strokeWidth="1.2"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={STAR_PATH} />
  </svg>
);
