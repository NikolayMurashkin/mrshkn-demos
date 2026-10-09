'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/consts';
import styles from './Header.module.scss';

/** Пункт текущего раздела — с чертой и `aria-current`: врач и услуга открываются из своих разделов. */
const isCurrent = (pathname: string, href: string) =>
  !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`));

export const HeaderNav = () => {
  const pathname = usePathname();

  return (
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
          aria-current={isCurrent(pathname, href) ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};
