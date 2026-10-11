import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { BOOKING_HREF, CTA, PLATE } from '@/consts';
import styles from './Plate.module.scss';

/** Плита над подвалом: вопрос и два пути — короткий тест и запись. На страницах записи, оплаты и квиза ее нет. */
export const Plate = () => (
  <section
    className={styles.plate}
    aria-labelledby="plate-title"
  >
    <h2
      className={styles.title}
      id="plate-title"
    >
      {PLATE.title}
    </h2>
    <div className={styles.actions}>
      <Link
        className={styles.quiz}
        href={PLATE.quizHref}
        prefetch={false}
      >
        {PLATE.quiz}
        <Arrow />
      </Link>
      <Link
        className={styles.booking}
        href={BOOKING_HREF}
        prefetch={false}
      >
        {CTA}
      </Link>
    </div>
  </section>
);
