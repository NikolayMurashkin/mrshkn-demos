import Link from 'next/link';
import { BOOKING_HREF, CTA, EXPERT } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './SiteHeader.module.scss';
import { SiteNav } from './SiteNav';

/** Шапка многостраничного сайта Editorial: мастхед с именем психолога, единственная CTA — запись, меню страниц. */
export const SiteHeader = () => (
  <header className={styles.header}>
    <div className={styles.masthead}>
      <div className={styles.caps}>
        <span className={styles.kicker}>{EXPERT.ways}</span>
        <span className={styles.location}>{DEMO.business.address?.addressLocality}</span>
        <div className={styles.controls}>
          <Link
            className={styles.cta}
            href={BOOKING_HREF}
            prefetch={false}
          >
            {CTA}
          </Link>
        </div>
      </div>
      <Link
        className={styles.sitemark}
        href="/"
        prefetch={false}
      >
        <span className={styles.name}>{EXPERT.name}</span>
        <span className={styles.tagline}>{EXPERT.role}</span>
      </Link>
    </div>
    <SiteNav />
  </header>
);
