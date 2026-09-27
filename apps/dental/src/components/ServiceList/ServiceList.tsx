import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { Service } from '@/payload-types';
import styles from './ServiceList.module.scss';

type ServiceListProps = {
  services: Service[];
};

/** Строки услуг, как таблица «Услуги» артборда: номер, название, коротко, цена «от». */
export const ServiceList = ({ services }: ServiceListProps) => (
  <ol className={styles.list}>
    {services.map((service, index) => (
      <li
        key={service.id}
        className={styles.row}
      >
        <span
          className={styles.number}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <Link
          className={styles.name}
          href={`/services/${service.slug}`}
          prefetch={false}
        >
          {service.title}
        </Link>
        <p className={styles.summary}>{typograph(service.summary)}</p>
        <p className={styles.price}>{formatPrice(service.priceFrom, true)}</p>
      </li>
    ))}
  </ol>
);
