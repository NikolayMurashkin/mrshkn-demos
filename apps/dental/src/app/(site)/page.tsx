import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { DemoReviews } from '@mrshkn/demo-core/components/DemoReviews';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { Contacts } from '@/components/Contacts';
import { DoctorCards } from '@/components/DoctorCards';
import { LicenseInfo } from '@/components/LicenseInfo';
import { Section } from '@/components/Section';
import { ServiceList } from '@/components/ServiceList';
import { getDoctors, getReviews, getServices } from '@/cms/queries';
import { CLINIC_KIND, CONTACTS_ID, FACTS, GUIDES, HERO, HOURS_TEXT } from '@/consts';
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
          <p className={styles.mark}>{CLINIC_KIND}</p>
          {address && <p className={styles.location}>{addressText(address)}</p>}
          <p className={styles.hours}>{HOURS_TEXT}</p>
        </div>
        <div className={styles.heroMain}>
          <h1
            className={styles.title}
            id="hero-title"
          >
            {HERO.title}
            <span className={styles.dot}>.</span>
          </h1>
          <div className={styles.row}>
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
        <span
          className={styles.rule}
          aria-hidden="true"
        />
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
        label="Услуги"
        title="Услуги и&nbsp;цены"
      >
        <ServiceList services={services} />
        <Link
          className={styles.more}
          href="/prices"
          prefetch={false}
        >
          Полный прайс
          <Arrow />
        </Link>
      </Section>
      <Section
        id="doctors"
        label="Врачи"
        title="Врачи"
        wide
      >
        <DoctorCards doctors={doctors} />
      </Section>
      <Section
        id="reviews"
        label="Отзывы"
      >
        <DemoReviews
          title="Отзывы пациентов"
          reviews={reviews}
        />
      </Section>
      <Section
        id="license"
        label="Лицензия"
        title="Лицензия"
      >
        <LicenseInfo />
      </Section>
      <Section
        id={CONTACTS_ID}
        label="Контакты"
        title="Контакты"
      >
        <Contacts />
      </Section>
    </>
  );
};

export default HomePage;
