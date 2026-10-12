import { typograph } from '@mrshkn/demo-core/typograph';
import { MENU_HREF, PICKS } from '../../consts';
import { formatPrice } from '../../lib/format';
import { firstOfEachCategory, menuHref } from '../../lib/menu';
import type { MenuItem, MenuOption } from '../../types';
import { Arrow } from '../Arrow';
import styles from './Picks.module.scss';

type PicksProps = {
  items: MenuItem[];
  categories: MenuOption[];
};

/** «Что взять» — первая позиция каждой категории по порядку меню; карточка ведет в меню этой категории. */
export const Picks = ({ items, categories }: PicksProps) => {
  const picks = firstOfEachCategory(items, categories);

  if (picks.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="picks-title"
    >
      <h2
        className={styles.title}
        id="picks-title"
      >
        {PICKS.title}
      </h2>
      <ul className={styles.plans}>
        {picks.map(({ category, item }) => (
          <li
            key={item.slug}
            className={styles.plan}
          >
            <a
              className={styles.card}
              href={menuHref({ category: category.slug, tags: [], qr: false })}
            >
              <span className={styles.tag}>{typograph(category.name)}</span>
              <span className={styles.name}>{typograph(item.name)}</span>
              {item.description && <span className={styles.summary}>{typograph(item.description)}</span>}
              <span className={styles.foot}>
                <span className={styles.price}>{formatPrice(item.price)}</span>
                <span className={styles.round}>
                  <Arrow diagonal />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a
        className={styles.all}
        href={MENU_HREF}
      >
        {PICKS.all}
        <Arrow diagonal />
      </a>
    </section>
  );
};
