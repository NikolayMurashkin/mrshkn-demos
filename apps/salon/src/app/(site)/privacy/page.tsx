import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { SitePlate } from '@/components/SitePlate';
import { PRIVACY_PAGE } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from '../page.module.scss';

export const metadata: Metadata = {
  title: PRIVACY_PAGE.title,
};

const PrivacyPage = () => (
  <>
    <main className={styles.page}>
      <div className={styles.policy}>
        <PrivacyPolicy
          withYandexReviews={Boolean(DEMO.yandexOrgId)}
          withYandexMap={Boolean(DEMO.business.geo)}
        />
      </div>
    </main>
    <SitePlate />
  </>
);

export default PrivacyPage;
