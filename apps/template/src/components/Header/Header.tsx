import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { NAV } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './Header.module.scss';

/** Шапка Swiss: знак — название дела, меню на якоря главной, справа единственная CTA шапки — запись. */
export const Header = () => (
  <header className={styles.header}>
    <Link
      className={styles.wordmark}
      href="/"
      prefetch={false}
    >
      {DEMO.business.name}
    </Link>
    <nav
      className={styles.nav}
      aria-label="Разделы страницы"
    >
      {NAV.map(({ href, label }) => (
        <a
          key={href}
          className={styles.link}
          href={href}
        >
          {label}
        </a>
      ))}
    </nav>
    <div className={styles.action}>
      <BookingButton
        formHref={`/#${LEAD_FORM_ID}`}
        miniAppUrl={DEMO.miniAppUrl}
      >
        Записаться
      </BookingButton>
    </div>
  </header>
);
