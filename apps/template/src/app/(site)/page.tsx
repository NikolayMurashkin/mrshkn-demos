import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { YandexReviews } from '@mrshkn/demo-core/components/YandexReviews';
import { LEAD_FORM_ID, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import { DEMO } from '@/demo.config';
import { TEMPLATE_FEATURES } from './consts';
import styles from './page.module.scss';

const HomePage = () => (
  <main className={styles.main}>
    <JsonLd data={buildBusinessJsonLd(DEMO)} />
    <section className={styles.hero}>
      <h1 className={styles.title}>{DEMO.title}</h1>
      <p className={styles.lead}>{DEMO.description}</p>
      <BookingButton
        formHref={`#${LEAD_FORM_ID}`}
        miniAppUrl={DEMO.miniAppUrl}
      >
        Записаться
      </BookingButton>
    </section>
    <section
      className={styles.section}
      aria-labelledby="features-title"
    >
      <h2 id="features-title">Что есть в&nbsp;каждом демо</h2>
      <ul className={styles.features}>
        {TEMPLATE_FEATURES.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
    <YandexReviews
      title="Отзывы"
      orgId={DEMO.yandexOrgId}
    />
    <section
      className={styles.section}
      id={LEAD_FORM_ID}
      aria-labelledby="lead-title"
    >
      <h2 id="lead-title">Оставить заявку</h2>
      <LeadForm policyHref={POLICY_HREF} />
    </section>
  </main>
);

export default HomePage;
