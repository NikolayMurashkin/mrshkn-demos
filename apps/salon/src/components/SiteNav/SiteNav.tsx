'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { HEADER_HEIGHT_VAR, NAV, NAV_LABEL } from '@/consts';
import { isCurrentNav } from '@/lib/nav';
import styles from './SiteNav.module.scss';

/**
 * Меню страниц: текущая — черта под словом и `aria-current`; на ≤ 720 — второй строкой шапки, не скрыто. Меню
 * на узком экране встает в одну или две строки, поэтому шапка замеряет себя и пишет высоту в CSS-переменную на `:root`:
 * от нее отступ якорей, чтобы цель перехода не уходила под шапку. К якорю из адреса браузер прокрутил до замера,
 * по запасному отступу, — после замера переход к нему повторяется.
 */
export const SiteNav = () => {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = navRef.current?.closest('header');

    if (!header) {
      return;
    }

    const root = document.documentElement;
    const measure = () => root.style.setProperty(HEADER_HEIGHT_VAR, `${header.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);

    measure();

    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }

    observer.observe(header);

    return () => {
      observer.disconnect();
      root.style.removeProperty(HEADER_HEIGHT_VAR);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={styles.nav}
      aria-label={NAV_LABEL}
    >
      {NAV.map(({ href, label }) => (
        <a
          key={href}
          className={styles.link}
          href={href}
          aria-current={isCurrentNav(pathname, href) ? 'page' : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  );
};
