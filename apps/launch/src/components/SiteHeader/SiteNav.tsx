'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, NAV_LABEL } from '@/consts';
import { isCurrent } from '@/lib/nav';
import styles from './SiteHeader.module.scss';

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
