import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { DEMO } from '@/demo.config';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Политика обработки персональных данных',
};

const PrivacyPage = () => (
  <>
    <SiteHeader />
    <main className={styles.page}>
      <div className={styles.text}>
        <PrivacyPolicy
          withYandexReviews={Boolean(DEMO.yandexOrgId)}
          withYandexMap={Boolean(DEMO.business.geo)}
        />
      </div>
    </main>
  </>
);

export default PrivacyPage;
