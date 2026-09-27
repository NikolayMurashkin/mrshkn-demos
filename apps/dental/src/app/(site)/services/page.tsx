import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { Section } from '@/components/Section';
import { ServiceList } from '@/components/ServiceList';
import { getServices } from '@/cms/queries';
import styles from '../content.module.scss';

export const metadata: Metadata = {
  title: 'Услуги',
  description: 'Лечение зубов, гигиена, имплантация, протезирование, исправление прикуса, удаление и детский прием.',
};

const ServicesPage = async () => {
  const services = await getServices();

  return (
    <>
      <PageIntro
        label="Услуги"
        title="Услуги и&nbsp;цены"
        lead="Цена в&nbsp;списке&nbsp;— от&nbsp;самой простой процедуры направления. Точную сумму врач называет после осмотра и&nbsp;записывает в&nbsp;план лечения."
      />
      <Section
        id="services"
        label="Все услуги"
      >
        <ServiceList services={services} />
        <p className={styles.note}>
          Все позиции с&nbsp;ценами&nbsp;— в&nbsp;
          <Link
            href="/prices"
            prefetch={false}
          >
            прайсе
          </Link>
          .
        </p>
      </Section>
    </>
  );
};

export default ServicesPage;
