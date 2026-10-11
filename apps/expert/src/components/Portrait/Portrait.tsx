import { EXPERT } from '@/consts';
import styles from './Portrait.module.scss';

/** Вместо фото — плита с инициалами: стоковое лицо выдавало бы себя за настоящего специалиста (D14). */
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
