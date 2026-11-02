import { EXPERT } from '@/consts';
import styles from './Portrait.module.scss';

export const Portrait = () => (
  <figure className={styles.portrait}>
    <span
      className={styles.plate}
      aria-hidden="true"
    >
      {EXPERT.initials}
    </span>
    <figcaption className={styles.caption}>
      {EXPERT.name}, {EXPERT.role}
    </figcaption>
  </figure>
);
