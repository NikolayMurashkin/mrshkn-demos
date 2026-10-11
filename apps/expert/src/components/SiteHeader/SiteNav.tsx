'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, NAV_LABEL } from '@/consts';
import styles from './SiteHeader.module.scss';

/** «Обо мне» текущий только на главной, статья подсвечивает «Статьи»; у записи и оплаты текущего пункта нет. */
const isCurrent = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

export const SiteNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className={styles.nav}
      aria-label={NAV_LABEL}
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
