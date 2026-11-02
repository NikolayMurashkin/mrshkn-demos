import Link from 'next/link';
import { LatestArticles } from '@/components/LatestArticles';
import { PageBlock } from '@/components/PageBlock';
import { PageIntro } from '@/components/PageIntro';
import { Portrait } from '@/components/Portrait';
import { Reviews } from '@/components/Reviews';
import { getArticles, getReviews } from '@/cms/queries';
import { ABOUT, BOOKING_HREF, CTA, HOME } from '@/consts';
import { latestArticles } from '@/lib/article';
import styles from '../content.module.scss';

const AboutPage = async () => {
  const [articles, reviews] = await Promise.all([getArticles(), getReviews()]);
  const latest = latestArticles(articles, HOME.articlesCount);

  return (
    <main className={styles.page}>
      <PageIntro
        title={ABOUT.title}
        lead={ABOUT.lead}
        aside={<Portrait />}
        dropcap
      >
        <Link
          href={BOOKING_HREF}
          prefetch={false}
        >
          {CTA}
        </Link>
      </PageIntro>
      {ABOUT.sections.map(({ id, title, paragraphs, numbered, items }) => {
        const List = numbered ? 'ol' : 'ul';

        return (
          <PageBlock
            key={id}
            id={id}
            title={title}
          >
            <div className={styles.text}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {items.length > 0 && (
                <List className={numbered ? `${styles.list} ${styles.numbered}` : styles.list}>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </List>
              )}
            </div>
          </PageBlock>
        );
      })}
      {latest.length > 0 && <LatestArticles articles={latest} />}
      <Reviews
        rubric={HOME.reviewsRubric}
        title={HOME.reviewsTitle}
        reviews={reviews}
      />
    </main>
  );
};

export default AboutPage;
