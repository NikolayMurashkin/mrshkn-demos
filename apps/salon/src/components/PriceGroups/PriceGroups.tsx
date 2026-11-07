import { typograph } from '@mrshkn/demo-core/typograph';
import { formatDuration, formatPriceFrom } from '@/lib/format';
import type { PriceGroup } from '@/types';
import styles from './PriceGroups.module.scss';

type PriceGroupsProps = {
  groups: PriceGroup[];
  /** Фраза о направлении под заголовком группы: на прайсе есть, на странице мастера нет. */
  withText?: boolean;
};

/** Прайс по направлениям: заголовок группы (якорь — код направления) и строки «услуга · длительность · от …». */
export const PriceGroups = ({ groups, withText = true }: PriceGroupsProps) =>
  groups.map(({ slug, name, text, services }) => (
    <section
      key={slug}
      className={styles.group}
      id={slug}
      aria-labelledby={`${slug}-title`}
    >
      <div className={styles.head}>
        <h2
          className={styles.title}
          id={`${slug}-title`}
        >
          {typograph(name)}
        </h2>
        {withText && <p className={styles.text}>{typograph(text)}</p>}
      </div>
      <ul className={styles.rows}>
        {services.map((service) => (
          <li
            key={service.slug}
            className={styles.row}
          >
            <span className={styles.name}>{typograph(service.name)}</span>
            <span className={styles.duration}>{formatDuration(service.duration)}</span>
            <span className={styles.price}>{formatPriceFrom(service.price)}</span>
          </li>
        ))}
      </ul>
    </section>
  ));
