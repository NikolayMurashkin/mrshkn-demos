import Link from 'next/link';
import { BookingLink } from '@/components/BookingLink';
import { SiteNav } from '@/components/SiteNav';
import { SALON } from '@/consts';
import styles from './SiteHeader.module.scss';

/** Стеклянная шапка: знак салона — ссылка на главную, меню страниц и запись. */
export const SiteHeader = () => (
  <header className={styles.header}>
    <div className={styles.bar}>
      <Link
        className={styles.mark}
        href="/"
      >
        <span
          className={styles.name}
          translate="no"
        >
          {SALON.name}
        </span>
        <span className={styles.kind}>{SALON.kind}</span>
      </Link>
      <SiteNav />
      <BookingLink size="sm" />
    </div>
  </header>
);
