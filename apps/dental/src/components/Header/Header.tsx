import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { CLINIC_BRAND, CLINIC_KIND, NAV } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './Header.module.scss';

export const Header = () => (
  <header className={styles.header}>
    <div className={styles.inner}>
      <Link
        className={styles.brand}
        href="/"
        prefetch={false}
      >
        {CLINIC_BRAND}
      </Link>
      <p className={styles.meta}>
        {CLINIC_KIND} · {DEMO.business.address?.addressLocality}
      </p>
      <nav
        className={styles.nav}
        aria-label="Разделы сайта"
      >
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            className={styles.link}
            href={href}
            prefetch={false}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.action}>
        <BookingButton
          formHref={`#${LEAD_FORM_ID}`}
          miniAppUrl={DEMO.miniAppUrl}
        >
          Записаться
        </BookingButton>
      </div>
    </div>
  </header>
);
