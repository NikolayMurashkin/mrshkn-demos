import type { SearchResult } from '@mrshkn/demo-core/search';
import Link from 'next/link';
import { SEARCH } from '@/consts';
import styles from './SearchResults.module.scss';

type SearchResultsProps = {
  results: SearchResult[];
};

/** Итог поиска: сколько нашлось и ссылки на страницы; пусто — подсказка, что искать. */
export const SearchResults = ({ results }: SearchResultsProps) => (
  <div className={styles.results}>
    <h2 className={styles.count}>
      {SEARCH.found}
      {results.length}
    </h2>
    {results.length > 0 ? (
      <ul className={styles.list}>
        {results.map(({ kind, title, href }) => (
          <li
            key={href}
            className={styles.item}
          >
            <p className={styles.kind}>{kind}</p>
            <Link
              className={styles.title}
              href={href}
              prefetch={false}
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className={styles.empty}>{SEARCH.empty}</p>
    )}
  </div>
);
