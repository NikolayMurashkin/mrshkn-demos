import { typograph } from '../../typograph';
import type { DemoReview } from '../../types';
import styles from './DemoReviews.module.scss';

type DemoReviewsProps = {
  title: string;
  reviews: DemoReview[];
};

/**
 * Отзывы о вымышленном деле демо: текст и подпись «имя и первая буква фамилии». Ни фото, ни оценок, ни подписи
 * площадки — блок не выдает себя за отзывы с Яндекс Карт или 2ГИС, а демо подписано подвалом.
 */
export const DemoReviews = ({ title, reviews }: DemoReviewsProps) => {
  if (!reviews.length) {
    return null;
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="demo-reviews-title"
    >
      <h2
        id="demo-reviews-title"
        className={styles.title}
      >
        {title}
      </h2>
      <ul className={styles.list}>
        {reviews.map((review) => (
          <li
            key={`${review.author}-${review.text.slice(0, 32)}`}
            className={styles.item}
          >
            <figure className={styles.review}>
              <blockquote className={styles.text}>{typograph(review.text)}</blockquote>
              <figcaption className={styles.caption}>
                <cite className={styles.author}>{review.author}</cite>
                {review.subject && <span className={styles.subject}>{typograph(review.subject)}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
};
