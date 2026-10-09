import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { DEMO } from '@/demo.config';
import styles from '../content.module.scss';

export const metadata: Metadata = {
  title: 'Политика обработки персональных данных',
};

const PrivacyPage = () => (
  <div className={styles.policy}>
    <p className={styles.policyMark}>Документ</p>
    <div className={styles.policyText}>
      <PrivacyPolicy
        withYandexReviews={Boolean(DEMO.yandexOrgId)}
        withYandexMap={Boolean(DEMO.business.geo)}
      />
    </div>
  </div>
);

export default PrivacyPage;
