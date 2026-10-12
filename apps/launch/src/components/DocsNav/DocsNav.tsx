import Link from 'next/link';
import { DOC_PAGES, DOCS } from '@/consts';
import { docHref } from '@/lib/docs';
import styles from './DocsNav.module.scss';

type DocsNavProps = {
  current: string;
};

/** Разделы документации по порядку чтения; текущий — `aria-current="page"`, отмечен кареткой `>` и жирным. */
export const DocsNav = ({ current }: DocsNavProps) => (
  <nav
    className={styles.nav}
    aria-label={DOCS.navTitle}
  >
    <ol className={styles.list}>
      {DOC_PAGES.map((page, index) => (
        <li key={page.slug}>
          <Link
            className={styles.link}
            href={docHref(page.slug)}
            prefetch={false}
            aria-current={page.slug === current ? 'page' : undefined}
          >
            <span
              className={styles.index}
              aria-hidden="true"
            >
              {page.slug === current ? '>' : String(index + 1).padStart(2, '0')}
            </span>
            <span className={styles.title}>{page.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  </nav>
);
