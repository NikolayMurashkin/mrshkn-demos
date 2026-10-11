import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import type { LexicalState } from '@/cms/types';
import type { Article } from '@/payload-types';
import { readingTime } from '@/lib/article';
import { formatDate } from '@/lib/format';
import styles from './ArticleList.module.scss';

type ArticleListProps = {
  articles: Article[];
};

/** Статьи материалами номера (CaseCard): обложка-плита, дата и время чтения, заголовок — ссылка на всю карточку, лид. */
export const ArticleList = ({ articles }: ArticleListProps) => (
  <ul className={styles.list}>
    {articles.map((article) => (
      <li
        key={article.id}
        className={styles.item}
      >
        <span
          className={styles.cover}
          aria-hidden="true"
        />
        <div className={styles.body}>
          <p className={styles.meta}>
            <time dateTime={article.publishedAt.slice(0, 10)}>{formatDate(article.publishedAt)}</time>
            <span>{readingTime(article.content as unknown as LexicalState, article.lead)}</span>
          </p>
          <h2 className={styles.title}>
            <Link
              href={`/articles/${article.slug}`}
              prefetch={false}
            >
              {typograph(article.title)}
            </Link>
          </h2>
          <p className={styles.lead}>{typograph(article.lead)}</p>
        </div>
      </li>
    ))}
  </ul>
);
