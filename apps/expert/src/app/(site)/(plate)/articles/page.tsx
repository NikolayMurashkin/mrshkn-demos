import type { Metadata } from 'next';
import { ArticleList } from '@/components/ArticleList';
import { PageIntro } from '@/components/PageIntro';
import { getArticles } from '@/cms/queries';
import { ARTICLES_PAGE } from '@/consts';
import styles from '../../content.module.scss';

export const metadata: Metadata = {
  title: ARTICLES_PAGE.title,
  description: ARTICLES_PAGE.lead,
};

const ArticlesPage = async () => {
  const articles = await getArticles();

  return (
    <main className={styles.page}>
      <PageIntro
        title={ARTICLES_PAGE.title}
        lead={ARTICLES_PAGE.lead}
      />
      <ArticleList articles={articles} />
    </main>
  );
};

export default ArticlesPage;
