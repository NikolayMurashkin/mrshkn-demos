import { typograph } from '@mrshkn/demo-core/typograph';
import { SectionHead } from '@/components/SectionHead';
import type { Review } from '@/payload-types';
import styles from './Reviews.module.scss';

type ReviewsProps = {
  rubric: string;
  title: string;
  reviews: Pick<Review, 'author' | 'text'>[];
};

/**
 * Отзывы вымышленных клиентов — выносками номера: текст антиквой между двойными линейками, под ним подпись «Имя Ф.».
 * Ни фото, ни оценок, ни площадки, ни формата встречи: демо подписано подвалом.
 */
export const Reviews = ({ rubric, title, reviews }: ReviewsProps) => {
  if (!reviews.length) {
    return null;
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="reviews-title"
    >
      <SectionHead
        id="reviews-title"
        rubric={rubric}
        title={title}
      />
      <ul className={styles.list}>
        {reviews.map(({ author, text }) => (
          <li
            key={`${author}-${text.slice(0, 32)}`}
            className={styles.item}
          >
            <figure className={styles.review}>
              <blockquote className={styles.quote}>{typograph(text)}</blockquote>
              <figcaption>
                <cite className={styles.author}>{typograph(author)}</cite>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
};
