import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { DemoReviews } from '@mrshkn/demo-core/components/DemoReviews';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { Contacts } from '@/components/Contacts';
import { DoctorCards } from '@/components/DoctorCards';
import { LicenseInfo } from '@/components/LicenseInfo';
import { Section } from '@/components/Section';
import { ServiceList } from '@/components/ServiceList';
import { getDoctors, getReviews, getServices } from '@/cms/queries';
import { CLINIC_KIND, CONTACTS_ID, FACTS, HERO } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText } from '@/lib/format';
import styles from './page.module.scss';

const HomePage = async () => {
  const [services, doctors, reviews] = await Promise.all([getServices(), getDoctors(), getReviews()]);
  const { address } = DEMO.business;

  return (
    <>
      <section
        className={styles.hero}
        aria-labelledby="hero-title"
      >
        <p className={styles.heroLabel}>
          <span>01&nbsp;— {CLINIC_KIND}</span>
          {address && <span className={styles.accent}>{addressText(address)}</span>}
        </p>
        <div className={styles.heroBody}>
          <h1
            className={styles.title}
            id="hero-title"
          >
            {HERO.title}
          </h1>
          <div className={styles.heroRow}>
            <p className={styles.lead}>{HERO.lead}</p>
            <div className={styles.actions}>
              <BookingButton
                formHref={`#${LEAD_FORM_ID}`}
                miniAppUrl={DEMO.miniAppUrl}
              >
                Записаться на&nbsp;прием
              </BookingButton>
              <Link
                className={styles.secondary}
                href="/prices"
                prefetch={false}
              >
                Смотреть цены
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ul
        className={styles.facts}
        aria-label="Коротко о&nbsp;клинике"
      >
        {FACTS.map((fact) => (
          <li
            key={fact.label}
            className={styles.fact}
          >
            <span className={styles.factLabel}>{fact.label}</span>
            <span className={styles.factValue}>{fact.value}</span>
            <span className={styles.factNote}>{fact.note}</span>
          </li>
        ))}
      </ul>
      <Section
        id="services"
        label="02&nbsp;— Услуги"
        title="Услуги и&nbsp;цены"
      >
        <ServiceList services={services} />
        <Link
          className={styles.more}
          href="/prices"
          prefetch={false}
        >
          Полный прайс
        </Link>
      </Section>
      <Section
        id="doctors"
        label="03&nbsp;— Врачи"
        title="Врачи"
      >
        <DoctorCards doctors={doctors} />
      </Section>
      <Section
        id="reviews"
        label="04&nbsp;— Отзывы"
      >
        <DemoReviews
          title="Отзывы пациентов"
          reviews={reviews}
        />
      </Section>
      <Section
        id="license"
        label="05&nbsp;— Лицензия"
        title="Лицензия"
      >
        <LicenseInfo />
      </Section>
      <Section
        id={CONTACTS_ID}
        label="06&nbsp;— Контакты"
        title="Контакты"
      >
        <Contacts />
      </Section>
    </>
  );
};

export default HomePage;
