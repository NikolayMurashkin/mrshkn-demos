import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { PRIVACY_PAGE } from '@/consts';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: PRIVACY_PAGE.title,
};

const PrivacyPage = () => (
  <main className={styles.page}>
    <div className={styles.layout}>
      <p className={styles.mark}>{PRIVACY_PAGE.mark}</p>
      <div className={styles.text}>
        <PrivacyPolicy withYandexReviews={false} />
      </div>
    </div>
  </main>
);

export default PrivacyPage;
