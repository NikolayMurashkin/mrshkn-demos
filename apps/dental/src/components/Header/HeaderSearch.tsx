'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SEARCH, SEARCH_HREF } from '@/consts';
import styles from './Header.module.scss';

/**
 * Ссылка на поиск лупой рядом со значком версии для слабовидящих: подпись видна на > 720, доступное имя начинается
 * с нее; на ≤ 720 — только иконка. На странице поиска — `aria-current`.
 */
export const HeaderSearch = () => {
  const pathname = usePathname();

  return (
    <Link
      className={styles.search}
      href={SEARCH_HREF}
      prefetch={false}
      aria-label={SEARCH.title}
      title={SEARCH.title}
      aria-current={pathname === SEARCH_HREF ? 'page' : undefined}
    >
      <svg
        className={styles.searchIcon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="10.5"
          cy="10.5"
          r="6.5"
        />
        <path d="m15.5 15.5 6 6" />
      </svg>
      <span className={styles.searchLabel}>{SEARCH.label}</span>
    </Link>
  );
};
