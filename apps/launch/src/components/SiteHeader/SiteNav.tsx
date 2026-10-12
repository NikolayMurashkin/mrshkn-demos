'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, NAV_LABEL } from '@/consts';
import type { NavItem } from '@/types';
import styles from './SiteHeader.module.scss';

/** Текущий пункт — раздел, в котором открыта страница; якоря главной текущими не бывают. */
const isCurrent = (pathname: string, { section }: NavItem) =>
  Boolean(section) && (pathname === section || pathname.startsWith(`${section}/`));

export const SiteNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className={styles.nav}
      aria-label={NAV_LABEL}
    >
      {NAV.map((item) => (
        <Link
          key={item.href}
          className={styles.link}
          href={item.href}
          prefetch={false}
          aria-current={isCurrent(pathname, item) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
