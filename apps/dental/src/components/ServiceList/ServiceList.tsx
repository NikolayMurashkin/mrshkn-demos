import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { Service } from '@/payload-types';
import { Arrow } from '../Arrow';
import styles from './ServiceList.module.scss';

type ServiceListProps = {
  services: Service[];
};

/**
 * Услуги строками прайса DS (PlanRow): номер, название, коротко, цена «от», стрелка. Вся строка — ссылка
 * на страницу услуги; имя ссылки — весь текст строки, чтобы скринридер не терял цену.
 */
export const ServiceList = ({ services }: ServiceListProps) => (
  <ol className={styles.list}>
    {services.map((service, index) => (
      <li
        key={service.id}
        className={styles.row}
      >
        <Link
          className={styles.link}
          href={`/services/${service.slug}`}
          prefetch={false}
        >
          <span
            className={styles.index}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={styles.name}>{typograph(service.title)}</span>
          <span className={styles.summary}>{typograph(service.summary)}</span>
          <span className={styles.price}>{formatPrice(service.priceFrom, true)}</span>
          <span className={styles.arrow}>
            <Arrow />
          </span>
        </Link>
      </li>
    ))}
  </ol>
);
