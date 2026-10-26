import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LowVisionToggle } from '@mrshkn/demo-core/components/LowVisionToggle';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { CLINIC_BRAND, CLINIC_KIND } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './Header.module.scss';
import { HeaderNav } from './HeaderNav';

/**
 * Шапка Swiss: знак клиники, подпись, меню разделов и единственная CTA шапки — запись. Значок версии для
 * слабовидящих — отдельной строкой над ними справа (≤ 720 — в ряд перед записью, 361–400 — в строке меню справа,
 * ≤ 360 — снова перед записью, меню своей строкой): в колонку записи он не влезает. В разметке значок перед меню —
 * порядок Tab как на экране.
 */
export const Header = () => (
  <header className={styles.header}>
    <Link
      className={styles.wordmark}
      href="/"
      prefetch={false}
    >
      {CLINIC_BRAND}
    </Link>
    <p className={styles.tagline}>
      {CLINIC_KIND}&nbsp;·&nbsp;{DEMO.business.address?.addressLocality}
    </p>
    <div className={styles.lowVision}>
      <LowVisionToggle />
    </div>
    <HeaderNav />
    <div className={styles.action}>
      <BookingButton
        formHref={`#${LEAD_FORM_ID}`}
        miniAppUrl={DEMO.miniAppUrl}
      >
        Записаться
      </BookingButton>
    </div>
  </header>
);
