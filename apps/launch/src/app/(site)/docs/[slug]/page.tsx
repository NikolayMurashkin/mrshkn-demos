import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsNav } from '@/components/DocsNav';
import { DocsPager } from '@/components/DocsPager';
import { DOC_PAGES, DOCS } from '@/consts';
import { findDocPage } from '@/lib/docs';
import styles from './page.module.scss';

type DocPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () => DOC_PAGES.map(({ slug }) => ({ slug }));

export const generateMetadata = async ({ params }: DocPageProps): Promise<Metadata> => {
  const page = findDocPage((await params).slug);

  return page ? { title: page.title, description: page.lead } : {};
};

const DocPage = async ({ params }: DocPageProps) => {
  const page = findDocPage((await params).slug);

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.label}>{DOCS.label}</p>
        <h1 className={styles.title}>{page.title}</h1>
        <p className={styles.lead}>{page.lead}</p>
      </header>
      <div className={styles.cols}>
        <div className={styles.main}>
          <article className={styles.prose}>
            {page.sections.map((section) => (
              <section
                key={section.id}
                className={styles.section}
                aria-labelledby={section.id}
              >
                <h2 id={section.id}>{section.title}</h2>
                {section.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.code && (
                  <pre
                    className={styles.code}
                    tabIndex={0}
                    translate="no"
                  >
                    <code>{section.code}</code>
                  </pre>
                )}
              </section>
            ))}
          </article>
          <DocsPager current={page.slug} />
        </div>
        <aside className={styles.aside}>
          <DocsNav current={page.slug} />
        </aside>
      </div>
    </main>
  );
};

export default DocPage;
