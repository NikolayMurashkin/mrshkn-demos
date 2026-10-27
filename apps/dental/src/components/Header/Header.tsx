import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LowVisionToggle } from '@mrshkn/demo-core/components/LowVisionToggle';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { CLINIC_BRAND, CLINIC_KIND } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './Header.module.scss';
import { HeaderNav } from './HeaderNav';
import { HeaderSearch } from './HeaderSearch';

/**
 * Шапка Swiss: знак клиники, подпись, меню разделов и единственная CTA шапки — запись. Лупа поиска и значок
 * версии для слабовидящих — отдельной строкой над ними справа (≤ 720 — в ряд перед записью; ≤ 408 — в первой строке
 * со знаком, запись и меню — своими строками): в колонку записи они не влезают.
 * В разметке запись перед меню — порядок Tab на ≤ 720 как на экране; на > 720 меню левее записи ставит сетка.
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
      <HeaderSearch />
      <LowVisionToggle />
    </div>
    <div className={styles.action}>
      <BookingButton
        formHref={`#${LEAD_FORM_ID}`}
        miniAppUrl={DEMO.miniAppUrl}
      >
        Записаться
      </BookingButton>
    </div>
    <HeaderNav />
  </header>
);
