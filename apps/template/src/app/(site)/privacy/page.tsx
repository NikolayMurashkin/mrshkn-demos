import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { DEMO } from '@/demo.config';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Политика обработки персональных данных',
};

const PrivacyPage = () => (
  <main className={styles.page}>
    <p className={styles.mark}>Документ</p>
    <div className={styles.text}>
      <PrivacyPolicy withYandexReviews={Boolean(DEMO.yandexOrgId)} />
    </div>
  </main>
);

export default PrivacyPage;
