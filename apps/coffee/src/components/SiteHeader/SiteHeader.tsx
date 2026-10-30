import Link from 'next/link';
import { LOYALTY_HREF, LOYALTY_LABEL, NAV } from '../../consts';
import type { SitePage } from '../../types';
import { Logo } from '../Logo';
import styles from './SiteHeader.module.scss';

type SiteHeaderProps = {
  /** Текущая страница: ее пункт меню или кнопка отмечены `aria-current="page"`. */
  current?: SitePage;
};

/** Шапка многостраничного демо: меню видно на всех ширинах — бургера нет, двух пунктов хватает и на 320. */
export const SiteHeader = ({ current }: SiteHeaderProps) => (
  <header className={styles.header}>
    <Link
      className={styles.brand}
      href="/"
      prefetch={false}
    >
      <Logo className={styles.logo} />
    </Link>
    <nav className={styles.nav}>
      {NAV.map(({ href, label, page }) => (
        <a
          key={href}
          className={styles.link}
          href={href}
          aria-current={page && page === current ? 'page' : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
    <a
      className={styles.cta}
      href={LOYALTY_HREF}
      aria-current={current === 'loyalty' ? 'page' : undefined}
    >
      {LOYALTY_LABEL}
    </a>
  </header>
);
