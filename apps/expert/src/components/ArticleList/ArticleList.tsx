import { Photo } from '@mrshkn/demo-core/components/Photo';
import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import type { LexicalState } from '@/cms/types';
import type { Article } from '@/payload-types';
import { coverSizes, readingTime } from '@/lib/article';
import { formatDate } from '@/lib/format';
import { photoOf } from '@/lib/photo';
import styles from './ArticleList.module.scss';

type ArticleListProps = {
  articles: Article[];
  /** Уровень заголовка карточки: на странице статей — h2, в блоке главной под своим h2 — h3. */
  headingLevel?: 'h2' | 'h3';
  /** Обложка первой карточки — кадр первого экрана: грузится сразу. */
  priority?: boolean;
};

/**
 * Статьи материалами номера (CaseCard): обложка — кадр статьи, дата и время чтения, заголовок — ссылка на всю
 * карточку, лид. Статья без кадра — без обложки, текст во всю ширину карточки.
 */
export const ArticleList = ({ articles, headingLevel: Heading = 'h2', priority = false }: ArticleListProps) => (
  <ul className={styles.list}>
    {articles.map((article, index) => {
      const cover = photoOf(article.photo);

      return (
        <li
          key={article.id}
          className={cover ? styles.item : `${styles.item} ${styles.bare}`}
        >
          {cover && (
            <Photo
              src={cover}
              alt=""
              sizes={coverSizes(index, articles.length)}
              priority={priority && index === 0}
              className={styles.cover}
            />
          )}
          <div className={styles.body}>
            <p className={styles.meta}>
              <time dateTime={article.publishedAt.slice(0, 10)}>{formatDate(article.publishedAt)}</time>
              <span>{readingTime(article.content as unknown as LexicalState, article.lead)}</span>
            </p>
            <Heading className={styles.title}>
              <Link
                href={`/articles/${article.slug}`}
                prefetch={false}
              >
                {typograph(article.title)}
              </Link>
            </Heading>
            <p className={styles.lead}>{typograph(article.lead)}</p>
          </div>
        </li>
      );
    })}
  </ul>
);
