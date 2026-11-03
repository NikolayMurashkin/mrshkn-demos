import { Photo } from '@mrshkn/demo-core/components/Photo';
import { typograph } from '@mrshkn/demo-core/typograph';
import { MENU, MENU_PHOTO_SIZES } from '../../consts';
import { formatPrice } from '../../lib/format';
import { groupMenu } from '../../lib/menu';
import { photoOf } from '../../lib/photo';
import type { MenuItem, MenuOption } from '../../types';
import styles from './MenuBoard.module.scss';

type MenuBoardProps = {
  items: MenuItem[];
  categories: MenuOption[];
  tags: MenuOption[];
  /** Сброс фильтра: в компактном виде сохраняет `qr=1`, чтобы гость у стойки не потерял его. */
  resetHref: string;
  /** Одна колонка и без кадров — компактное меню у стойки: страница легкая, грузится быстро и по мобильной сети. */
  single?: boolean;
};

/**
 * Позиции по категориям: категория — стикер с ярлыком на кромке, строка — миниатюра, название, лидеры и цена.
 * Миниатюра без подписи: название позиции рядом текстом.
 */
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
              const photo = single ? undefined : photoOf(item.photo);

              return (
                <li
                  key={item.slug}
                  className={photo ? `${styles.item} ${styles.withPhoto}` : styles.item}
                >
                  {photo && (
                    <Photo
                      className={styles.photo}
                      src={photo}
                      alt=""
                      sizes={MENU_PHOTO_SIZES}
                    />
                  )}
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
