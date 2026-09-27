import { YANDEX_ORG_ID_PATTERN } from '../../consts';
import styles from './YandexReviews.module.scss';

type YandexReviewsProps = {
  title: string;
  orgId?: string;
};

/**
 * Отзывы берутся официальным виджетом Яндекс Карт по номеру организации: своих отзывов демо не пишет (D14).
 * У вымышленного дела организации нет — тогда раздела нет совсем, а не пустой рамки.
 */
export const YandexReviews = ({ title, orgId }: YandexReviewsProps) => {
  if (!orgId) {
    return null;
  }

  if (!YANDEX_ORG_ID_PATTERN.test(orgId)) {
    throw new Error(`yandexOrgId должен состоять из цифр, пришло «${orgId}»`);
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="reviews-title"
    >
      <h2
        id="reviews-title"
        className={styles.title}
      >
        {title}
      </h2>
      <iframe
        className={styles.frame}
        src={`https://yandex.ru/maps-reviews-widget/${orgId}?comments`}
        title="Отзывы на Яндекс Картах"
        loading="lazy"
      />
      <a href={`https://yandex.ru/maps/org/${orgId}/reviews/`}>Все отзывы на Яндекс Картах</a>
    </section>
  );
};
