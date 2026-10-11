import Link from 'next/link';
import { PageBlock } from '@/components/PageBlock';
import { PageIntro } from '@/components/PageIntro';
import { Portrait } from '@/components/Portrait';
import { ABOUT, BOOKING_HREF, CTA } from '@/consts';
import styles from '../content.module.scss';

const AboutPage = () => (
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
    {ABOUT.sections.map(({ id, title, numbered, items }) => {
      const List = numbered ? 'ol' : 'ul';

      return (
        <PageBlock
          key={id}
          id={id}
          title={title}
        >
          <List className={numbered ? `${styles.list} ${styles.numbered}` : styles.list}>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>
        </PageBlock>
      );
    })}
  </main>
);

export default AboutPage;
