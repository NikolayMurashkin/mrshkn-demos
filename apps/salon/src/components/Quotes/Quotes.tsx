import { typograph } from '@mrshkn/demo-core/typograph';
import { reviewMasterLabel } from '@/lib/format';
import type { Review } from '@/types';
import styles from './Quotes.module.scss';

type QuotesProps = {
  reviews: Review[];
};

/**
 * Отзывы вымышленных гостей: текст, подпись «Имя Ф.», услуга и мастер. Ни фото, ни звезд, ни площадки и ни разметки
 * `Review` — вымысел подписан подвалом демо.
 */
export const Quotes = ({ reviews }: QuotesProps) => (
  <ul className={styles.quotes}>
    {reviews.map(({ author, text, subject, master }) => (
      <li
        key={`${author}-${text.slice(0, 32)}`}
        className={styles.quote}
      >
        <figure className={styles.figure}>
          <blockquote className={styles.text}>
            <p>{typograph(text)}</p>
          </blockquote>
          <figcaption className={styles.caption}>
            <cite className={styles.author}>{typograph(author)}</cite>
            {(subject || master) && (
              <span className={styles.meta}>
                {subject && <span>{typograph(subject)}</span>}
                {master && <span>{reviewMasterLabel(master.name)}</span>}
              </span>
            )}
          </figcaption>
        </figure>
      </li>
    ))}
  </ul>
);
