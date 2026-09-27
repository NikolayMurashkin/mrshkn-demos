import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import styles from '../page.module.scss';

export const metadata: Metadata = {
  title: 'Политика обработки персональных данных',
};

const PrivacyPage = () => (
  <main className={styles.main}>
    <PrivacyPolicy />
  </main>
);

export default PrivacyPage;
