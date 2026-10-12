import { typograph } from '@mrshkn/demo-core/typograph';
import { MENU } from '../../consts';
import { formatPrice } from '../../lib/format';
import { groupMenu } from '../../lib/menu';
import type { MenuItem, MenuOption } from '../../types';
import styles from './MenuBoard.module.scss';

type MenuBoardProps = {
  items: MenuItem[];
  categories: MenuOption[];
  tags: MenuOption[];
  /** Сброс фильтра: в компактном виде сохраняет `qr=1`, чтобы гость у стойки не потерял его. */
  resetHref: string;
  /** Одна колонка — в компактном меню на любой ширине. */
  single?: boolean;
};

/** Позиции по категориям: категория — стикер с ярлыком на кромке, строка — название, лидеры и цена. */
export const MenuBoard = ({ items, categories, tags, resetHref, single = false }: MenuBoardProps) => {
  const groups = groupMenu(items, categories);
  const tagNames = new Map(tags.map(({ slug, name }) => [slug, name]));

  if (groups.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>{MENU.empty}</p>
        <a
          className={styles.reset}
          href={resetHref}
        >
          {MENU.reset}
        </a>
      </div>
    );
  }

  return (
    <div className={single ? `${styles.board} ${styles.single}` : styles.board}>
      {groups.map(({ category, items: groupItems }) => (
        <section
          key={category.slug}
          className={styles.group}
          aria-labelledby={`menu-${category.slug}`}
        >
          <h2
            className={styles.title}
            id={`menu-${category.slug}`}
          >
            {typograph(category.name)}
          </h2>
          <ul className={styles.items}>
            {groupItems.map((item) => {
              const itemTags = item.tags.flatMap((tag) => tagNames.get(tag) ?? []);

              return (
                <li
                  key={item.slug}
                  className={styles.item}
                >
                  <span className={styles.name}>{typograph(item.name)}</span>
                  <span
                    className={styles.dots}
                    aria-hidden="true"
                  />
                  <span className={styles.price}>{formatPrice(item.price)}</span>
                  {(item.description || itemTags.length > 0) && (
                    <span className={styles.meta}>
                      {item.description && <span className={styles.desc}>{typograph(item.description)}</span>}
                      {itemTags.map((name) => (
                        <span
                          key={name}
                          className={styles.tag}
                        >
                          {typograph(name)}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};
