import { typograph } from '@mrshkn/demo-core/typograph';
import { ArrowIcon } from '@/components/Icons';
import { PRICES_HREF } from '@/consts';
import { formatPriceFrom } from '@/lib/format';
import type { PriceGroup } from '@/types';
import styles from './CategoryTiles.module.scss';

type CategoryTilesProps = {
  groups: PriceGroup[];
};

/** Направления салона: плитка — ссылка на группу прайса, «от» — цена первой (основной) услуги направления. */
export const CategoryTiles = ({ groups }: CategoryTilesProps) => (
  <ul className={styles.tiles}>
    {groups.map(({ slug, name, text, services }) => (
      <li
        key={slug}
        className={styles.tile}
      >
        <span
          className={styles.drop}
          aria-hidden="true"
        />
        <h3 className={styles.title}>
          <a href={`${PRICES_HREF}#${slug}`}>{typograph(name)}</a>
        </h3>
        <p className={styles.text}>{typograph(text)}</p>
        <span className={styles.from}>{formatPriceFrom(services[0].price)}</span>
        <span className={styles.arrow}>
          <ArrowIcon />
        </span>
      </li>
    ))}
  </ul>
);
