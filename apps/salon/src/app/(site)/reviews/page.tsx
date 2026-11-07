import type { Metadata } from 'next';
import { PageIntro } from '@/components/PageIntro';
import { Quotes } from '@/components/Quotes';
import { SitePlate } from '@/components/SitePlate';
import { getReviews } from '@/cms/queries';
import { REVIEWS_PAGE } from '@/consts';
import styles from '../page.module.scss';

export const metadata: Metadata = {
  title: REVIEWS_PAGE.title,
  description: REVIEWS_PAGE.description,
};

/** Все отзывы; пусто в CMS — вместо лида строка «Отзывов пока нет», без пустого списка. */
const ReviewsPage = async () => {
  const reviews = await getReviews();

  return (
    <>
      <main className={styles.page}>
        <PageIntro
          title={REVIEWS_PAGE.title}
          lead={reviews.length > 0 ? REVIEWS_PAGE.lead : REVIEWS_PAGE.empty}
        />
        {reviews.length > 0 && <Quotes reviews={reviews} />}
      </main>
      <SitePlate />
    </>
  );
};

export default ReviewsPage;
