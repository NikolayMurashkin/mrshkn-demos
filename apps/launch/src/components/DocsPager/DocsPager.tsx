import Link from 'next/link';
import { DOCS } from '@/consts';
import { docHref, docNeighbours } from '@/lib/docs';
import styles from './DocsPager.module.scss';

type DocsPagerProps = {
  current: string;
};

/** Соседние разделы документации внизу страницы: предыдущий слева, следующий справа. */
export const DocsPager = ({ current }: DocsPagerProps) => {
  const { prev, next } = docNeighbours(current);

  return (
    <nav
      className={styles.pager}
      aria-label={DOCS.pagerTitle}
    >
      {prev && (
        <Link
          className={styles.link}
          href={docHref(prev.slug)}
          prefetch={false}
          rel="prev"
        >
          <span className={styles.label}>
            <span aria-hidden="true">← </span>
            {DOCS.prev}
          </span>
          <span className={styles.title}>{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link
          className={`${styles.link} ${styles.next}`}
          href={docHref(next.slug)}
          prefetch={false}
          rel="next"
        >
          <span className={styles.label}>
            {DOCS.next}
            <span aria-hidden="true"> →</span>
          </span>
          <span className={styles.title}>{next.title}</span>
        </Link>
      )}
    </nav>
  );
};
