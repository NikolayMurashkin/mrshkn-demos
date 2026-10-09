import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { YandexReviews } from '@mrshkn/demo-core/components/YandexReviews';
import { LEAD_FORM_ID, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import { typograph } from '@mrshkn/demo-core/typograph';
import { Arrow } from '@/components/Arrow';
import { Section } from '@/components/Section';
import { GUIDES, HERO_LABEL, TEMPLATE_FEATURES } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './page.module.scss';

const HomePage = () => (
  <main className={styles.main}>
    <JsonLd data={buildBusinessJsonLd(DEMO)} />
    <section
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div
        className={styles.guides}
        aria-hidden="true"
      >
        {GUIDES.map((guide) => (
          <span key={guide} />
        ))}
      </div>
      <div className={styles.aside}>
        <span
          className={styles.index}
          aria-hidden="true"
        />
        <p className={styles.mark}>{HERO_LABEL}</p>
      </div>
      <div className={styles.heroMain}>
        <h1
          className={styles.title}
          id="hero-title"
        >
          {typograph(DEMO.title)}
          <span className={styles.dot}>.</span>
        </h1>
        <div className={styles.row}>
          <p className={styles.lead}>{typograph(DEMO.description)}</p>
          <div className={styles.actions}>
            <a
              className={styles.primary}
              href={`#${LEAD_FORM_ID}`}
            >
              Оставить заявку
              <Arrow />
            </a>
            <a
              className={styles.secondary}
              href="#features"
            >
              Что внутри
            </a>
          </div>
        </div>
      </div>
      <span
        className={styles.rule}
        aria-hidden="true"
      />
    </section>
    <Section
      id="features"
      label="Состав"
      title="Что есть в&nbsp;каждом демо"
    >
      <ol className={styles.features}>
        {TEMPLATE_FEATURES.map((feature) => (
          <li
            key={feature}
            className={styles.feature}
          >
            {feature}
          </li>
        ))}
      </ol>
    </Section>
    {DEMO.yandexOrgId && (
      <Section
        id="reviews"
        label="Отзывы"
      >
        <YandexReviews
          title="Отзывы"
          orgId={DEMO.yandexOrgId}
        />
      </Section>
    )}
    <Section
      id={LEAD_FORM_ID}
      label="Заявка"
      title="Оставить заявку"
    >
      <LeadForm policyHref={POLICY_HREF} />
    </Section>
  </main>
);

export default HomePage;
