import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { PriceTable } from '@/components/PriceTable';
import { Section } from '@/components/Section';
import { getServices } from '@/cms/queries';
import styles from '../content.module.scss';

export const metadata: Metadata = {
  title: 'Цены',
  description:
    'Прайс стоматологии: лечение, гигиена, имплантация, протезирование, ортодонтия, хирургия, детский прием.',
};

const PricesPage = async () => {
  const services = await getServices();

  return (
    <>
      <PageIntro
        label="Прайс"
        title="Цены"
        lead="Цены в&nbsp;рублях. После осмотра врач составляет план лечения с&nbsp;итоговой суммой, и&nbsp;без вашего согласия она не&nbsp;меняется."
      />
      <Section
        id="price-list"
        label="Прайс по&nbsp;услугам"
      >
        {services.map((service) => (
          <div
            key={service.id}
            className={styles.group}
            id={service.slug}
          >
            <h2 className={styles.groupTitle}>
              <Link
                href={`/services/${service.slug}`}
                prefetch={false}
              >
                {service.title}
              </Link>
            </h2>
            <PriceTable
              caption={`Цены: ${service.title}`}
              prices={service.prices}
            />
          </div>
        ))}
      </Section>
    </>
  );
};

export default PricesPage;
