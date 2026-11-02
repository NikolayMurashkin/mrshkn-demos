import Link from 'next/link';
import { ArticleList } from '@/components/ArticleList';
import { Arrow } from '@/components/Arrow';
import { SectionHead } from '@/components/SectionHead';
import { HOME } from '@/consts';
import type { Article } from '@/payload-types';
import styles from './LatestArticles.module.scss';

type LatestArticlesProps = {
  articles: Article[];
};

/** Последние статьи на главной (WorksSection): рубрика, заголовок раздела, материалы номера, ссылка на все статьи. */
export const LatestArticles = ({ articles }: LatestArticlesProps) => (
  <section
    className={styles.section}
    aria-labelledby="latest-articles-title"
  >
    <SectionHead
      id="latest-articles-title"
      rubric={HOME.articlesRubric}
      title={HOME.articlesTitle}
    />
    <ArticleList
      articles={articles}
      headingLevel="h3"
    />
    <Link
      className={styles.all}
      href={HOME.allArticlesHref}
      prefetch={false}
    >
      {HOME.allArticles}
      <Arrow />
    </Link>
  </section>
);
