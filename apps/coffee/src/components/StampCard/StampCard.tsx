import { STAMP_CELLS } from '../../consts';
import { Star } from '../Star';
import { Wordmark } from '../Wordmark';
import styles from './StampCard.module.scss';

/** Карта-штамп как образ «10-я чашка — от нас»: не состояние гостя, поэтому без номеров и отметок. */
export const StampCard = () => (
  <div
    className={styles.card}
    aria-hidden="true"
  >
    <Wordmark className={styles.wordmark} />
    <div className={styles.grid}>
      {STAMP_CELLS.map((cell) => (
        <span
          key={cell}
          className={styles.cell}
        />
      ))}
      <span className={`${styles.cell} ${styles.gift}`}>
        <Star className={styles.star} />
      </span>
    </div>
  </div>
);
