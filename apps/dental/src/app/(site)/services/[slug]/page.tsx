import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import { paragraphs, typograph } from '@mrshkn/demo-core/typograph';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DoctorCards } from '@/components/DoctorCards';
import { PageIntro } from '@/components/PageIntro';
import { PriceTable } from '@/components/PriceTable';
import { Section } from '@/components/Section';
import { getDoctorsOfService, getService } from '@/cms/queries';
import { DEMO } from '@/demo.config';
import { formatPrice } from '@/lib/format';
import styles from '../../content.module.scss';

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: ServicePageProps): Promise<Metadata> => {
  const service = await getService((await params).slug);

  return service ? { title: service.title, description: service.summary } : {};
};

const ServicePage = async ({ params }: ServicePageProps) => {
  const service = await getService((await params).slug);

  if (!service) {
    notFound();
  }

  const doctors = await getDoctorsOfService(service.id);

  return (
    <>
      <PageIntro
        label="Услуга"
        note={formatPrice(service.priceFrom, true)}
        title={typograph(service.title)}
        lead={typograph(service.summary)}
        back={{ href: '/services', label: 'Все услуги' }}
      >
        <BookingButton
          formHref={`#${LEAD_FORM_ID}`}
          miniAppUrl={DEMO.miniAppUrl}
        >
          Записаться
        </BookingButton>
      </PageIntro>
      <Section
        id="prices"
        label="Цены"
        title="Цены"
      >
        <PriceTable
          caption={`Цены: ${service.title}`}
          prices={service.prices}
        />
      </Section>
      <Section
        id="about"
        label="Лечение"
        title="Как проходит лечение"
      >
        <div className={styles.text}>
          {paragraphs(service.description).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>
      {doctors.length > 0 && (
        <Section
          id="doctors"
          label="Врачи"
          title="Кто ведет"
          wide
        >
          <DoctorCards doctors={doctors} />
        </Section>
      )}
    </>
  );
};

export default ServicePage;
