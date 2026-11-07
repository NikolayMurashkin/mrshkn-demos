import { BookingLink } from '@/components/BookingLink';
import { Drops } from '@/components/Drops';
import { BOT_NOTE, PLATE } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './SitePlate.module.scss';

/** Плита записи над подвалом — на всех страницах, кроме записи: вопрос-призыв слева, запись справа. */
export const SitePlate = () => (
  <section
    className={styles.plate}
    aria-labelledby="plate-title"
  >
    <Drops variant="small" />
    <h2
      className={styles.title}
      id="plate-title"
    >
      {DEMO.miniAppUrl ? PLATE.bot : PLATE.form}
    </h2>
    <div className={styles.actions}>
      <BookingLink />
      {DEMO.miniAppUrl && <p className={styles.note}>{BOT_NOTE}</p>}
    </div>
  </section>
);
