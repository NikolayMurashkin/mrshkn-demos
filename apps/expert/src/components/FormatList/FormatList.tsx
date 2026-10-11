import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import type { Format } from '@/payload-types';
import { BOOKING_HREF, FORMATS_PAGE } from '@/consts';
import { formatMeta, formatPrice } from '@/lib/format';
import styles from './FormatList.module.scss';

type FormatListProps = {
  formats: Format[];
};

/** Форматы оглавлением журнала (PlanRow): название · отточия · цена, ниже описание и «длительность · где». */
export const FormatList = ({ formats }: FormatListProps) => (
  <ul className={styles.list}>
    {formats.map((format) => (
      <li
        key={format.id}
        className={styles.item}
      >
        <Link
          className={styles.link}
          href={`${BOOKING_HREF}?format=${format.slug}`}
          prefetch={false}
          aria-label={FORMATS_PAGE.bookLabel(format.title)}
        >
          <span className={styles.line}>
            <span className={styles.name}>{typograph(format.title)}</span>
            <span
              className={styles.leader}
              aria-hidden="true"
            />
          </span>
          <span className={styles.price}>{formatPrice(format.price)}</span>
          <span className={styles.summary}>{typograph(format.summary)}</span>
          <span className={styles.term}>{typograph(formatMeta(format))}</span>
        </Link>
      </li>
    ))}
  </ul>
);
