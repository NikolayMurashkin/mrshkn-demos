import config from '@payload-config';
import { DemoReviews } from '@mrshkn/demo-core/components/DemoReviews';
import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { getReviews, getWhereItHurts } from '@/cms/queries';
import { Contacts } from '@/components/Contacts';
import { Header } from '@/components/Header';
import { NodeCard } from '@/components/NodeCard';
import { Poster } from '@/components/Poster';
import { WhereItHurts } from '@/components/WhereItHurts';
import { LANGS } from '@/consts';
import { DEMOS } from '@/demo.config';
import { isDemoLang, langHref, policyHref } from '@/lib/lang';
import { TEXTS } from '@/texts';
import type { LangPageProps } from '@/types';
import styles from './page.module.scss';

export const generateMetadata = async ({ params }: LangPageProps): Promise<Metadata> => {
  const { lang } = await params;

  return {
    alternates: {
      canonical: isDemoLang(lang) ? langHref(lang) : undefined,
      languages: { ...Object.fromEntries(LANGS.map((item) => [item, langHref(item)])), 'x-default': langHref('ru') },
    },
  };
};

const HomePage = async ({ params }: LangPageProps) => {
  const { lang } = await params;

  if (!isDemoLang(lang)) {
    notFound();
  }

  const payload = await getPayload({ config });
  const [data, reviews] = await Promise.all([getWhereItHurts(payload, lang), getReviews(payload, lang)]);
  const texts = TEXTS[lang];
  const demo = DEMOS[lang];

  return (
    <>
      <Header lang={lang} />
      <main className={styles.main}>
        <JsonLd data={buildBusinessJsonLd(demo)} />
        <WhereItHurts
          data={data}
          lang={lang}
          poster={<Poster alt={texts.hero.posterAlt} />}
        />
        <section
          className={styles.section}
          id="nodes"
          aria-labelledby="nodes-title"
        >
          <div className={styles.head}>
            <h2
              className={styles.title}
              id="nodes-title"
            >
              {texts.nodes.title}
            </h2>
            <p className={styles.lead}>{texts.nodes.lead}</p>
          </div>
          <ul className={styles.grid}>
            {data.nodes.map((node) => (
              <li
                key={node.key}
                className={styles.item}
              >
                <NodeCard
                  node={node}
                  lang={lang}
                  titleId={`node-${node.key}`}
                />
              </li>
            ))}
          </ul>
        </section>
        <section
          className={styles.section}
          id={LEAD_FORM_ID}
          aria-labelledby="booking-title"
        >
          <div className={styles.head}>
            <h2
              className={styles.title}
              id="booking-title"
            >
              {texts.booking.title}
            </h2>
            <p className={styles.lead}>{texts.booking.lead}</p>
          </div>
          <div className={styles.form}>
            <LeadForm
              lang={lang}
              policyHref={policyHref(lang)}
            />
          </div>
        </section>
        {reviews.length > 0 && (
          <div
            className={styles.section}
            id="reviews"
          >
            <DemoReviews
              title={texts.reviews.title}
              reviews={reviews}
            />
          </div>
        )}
        <section
          className={styles.section}
          id="contacts"
          aria-labelledby="contacts-title"
        >
          <div className={styles.head}>
            <h2
              className={styles.title}
              id="contacts-title"
            >
              {texts.contacts.title}
            </h2>
          </div>
          <Contacts
            demo={demo}
            lang={lang}
          />
        </section>
      </main>
    </>
  );
};

export default HomePage;
