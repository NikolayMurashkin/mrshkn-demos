import Link from 'next/link';
import { HEADER_CTA, PRODUCT } from '@/consts';
import styles from './SiteHeader.module.scss';
import { SiteNav } from './SiteNav';

/** Шапка многостраничного сайта Terminal: знак продукта, меню разделов, единственная CTA — быстрый старт. */
export const SiteHeader = () => (
  <header className={styles.header}>
    <Link
      className={styles.brand}
      href="/"
      prefetch={false}
    >
      <span
        className={styles.wordmark}
        translate="no"
      >
        <span className={styles.path}>~/</span>
        {PRODUCT.wordmark}
      </span>
      <span className={styles.tagline}>{PRODUCT.tagline}</span>
    </Link>
    <SiteNav />
    <Link
      className={styles.cta}
      href={HEADER_CTA.href}
      prefetch={false}
    >
      {HEADER_CTA.label}
    </Link>
  </header>
);
