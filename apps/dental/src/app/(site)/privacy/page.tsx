import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { DEMO } from '@/demo.config';
import styles from '../content.module.scss';

export const metadata: Metadata = {
  title: 'Политика обработки персональных данных',
};

const PrivacyPage = () => (
  <div className={styles.policy}>
    <PrivacyPolicy
      withYandexReviews={Boolean(DEMO.yandexOrgId)}
      withYandexMap={Boolean(DEMO.business.geo)}
    />
  </div>
);

export default PrivacyPage;
