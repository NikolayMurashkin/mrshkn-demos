import { typograph } from '@mrshkn/demo-core/typograph';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleText } from '@/components/ArticleText';
import { ArticleToc } from '@/components/ArticleToc';
import { PageIntro } from '@/components/PageIntro';
import { getArticle } from '@/cms/queries';
import type { LexicalState } from '@/cms/types';
import { ARTICLES_PAGE } from '@/consts';
import { readingTime, sectionsOf, withAnchors } from '@/lib/article';
import { formatDate } from '@/lib/format';
import styles from './page.module.scss';

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: ArticlePageProps): Promise<Metadata> => {
  const article = await getArticle((await params).slug);

  return article ? { title: article.title, description: article.lead } : {};
};

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const article = await getArticle((await params).slug);

  if (!article) {
    notFound();
  }

  const content = article.content as unknown as LexicalState;
  const sections = sectionsOf(content);

  return (
    <main className={styles.page}>
      <Link
        className={styles.back}
        href="/articles"
        prefetch={false}
      >
        <span aria-hidden="true">←</span>
        {ARTICLES_PAGE.back}
      </Link>
      <article
        className={styles.article}
        aria-labelledby="page-title"
      >
        <PageIntro
          title={typograph(article.title)}
          lead={typograph(article.lead)}
          aside={
            <p className={styles.meta}>
              <time dateTime={article.publishedAt.slice(0, 10)}>{formatDate(article.publishedAt)}</time>
              <span>{readingTime(content, article.lead)}</span>
            </p>
          }
        />
        <div className={styles.body}>
          {sections.length > 0 && <ArticleToc sections={sections} />}
          <div className={styles.text}>
            <ArticleText content={withAnchors(content, sections)} />
          </div>
        </div>
      </article>
    </main>
  );
};

export default ArticlePage;
