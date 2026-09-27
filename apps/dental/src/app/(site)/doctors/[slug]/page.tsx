import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import { paragraphs } from '@mrshkn/demo-core/typograph';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageIntro } from '@/components/PageIntro';
import { Section } from '@/components/Section';
import { ServiceList } from '@/components/ServiceList';
import { getDoctor } from '@/cms/queries';
import { DEMO } from '@/demo.config';
import { practiceSinceText } from '@/lib/format';
import type { Service } from '@/payload-types';
import styles from '../../content.module.scss';

type DoctorPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: DoctorPageProps): Promise<Metadata> => {
  const doctor = await getDoctor((await params).slug);

  return doctor ? { title: doctor.name, description: `${doctor.position}. ${paragraphs(doctor.about)[0] ?? ''}` } : {};
};

const DoctorPage = async ({ params }: DoctorPageProps) => {
  const doctor = await getDoctor((await params).slug);

  if (!doctor) {
    notFound();
  }

  const services = (doctor.services ?? []).filter((service): service is Service => typeof service === 'object');

  return (
    <>
      <PageIntro
        label="Врач"
        note={doctor.position}
        title={doctor.name}
        lead={practiceSinceText(doctor.practiceSince)}
      >
        <BookingButton
          formHref={`#${LEAD_FORM_ID}`}
          miniAppUrl={DEMO.miniAppUrl}
        >
          Записаться к&nbsp;врачу
        </BookingButton>
      </PageIntro>
      <Section
        id="about"
        label="О враче"
        title="О враче"
      >
        <div className={styles.text}>
          {paragraphs(doctor.about).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>
      {Boolean(doctor.education?.length) && (
        <Section
          id="education"
          label="Образование"
          title="Образование"
        >
          <ul className={styles.list}>
            {doctor.education?.map(({ id, item }) => (
              <li key={id ?? item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}
      {services.length > 0 && (
        <Section
          id="services"
          label="Услуги"
          title="Что лечит"
        >
          <ServiceList services={services} />
        </Section>
      )}
    </>
  );
};

export default DoctorPage;
