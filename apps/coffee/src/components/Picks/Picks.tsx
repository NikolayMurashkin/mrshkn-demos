import { Photo } from '@mrshkn/demo-core/components/Photo';
import { typograph } from '@mrshkn/demo-core/typograph';
import { MENU_HREF, PICKS, PICKS_PHOTO_SIZES } from '../../consts';
import { formatPrice } from '../../lib/format';
import { firstOfEachCategory, menuHref } from '../../lib/menu';
import { photoOf } from '../../lib/photo';
import type { MenuItem, MenuOption } from '../../types';
import { Arrow } from '../Arrow';
import styles from './Picks.module.scss';

type PicksProps = {
  items: MenuItem[];
  categories: MenuOption[];
  tags: MenuOption[];
};

/**
 * «Что взять» — первая позиция каждой категории по порядку меню; карточка ведет в меню этой категории. На кадре
 * позиции — ее признаки стикерами; кадр без подписи: название позиции рядом текстом.
 */
export const Picks = ({ items, categories, tags }: PicksProps) => {
  const picks = firstOfEachCategory(items, categories);
  const tagNames = new Map(tags.map(({ slug, name }) => [slug, name]));

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
        {picks.map(({ category, item }) => {
          const photo = photoOf(item.photo);
          const itemTags = item.tags.flatMap((tag) => tagNames.get(tag) ?? []);

          return (
            <li
              key={item.slug}
              className={styles.plan}
            >
              <a
                className={styles.card}
                href={menuHref({ category: category.slug, tags: [], qr: false })}
                aria-label={PICKS.cardLabel(item.name)}
              >
                {photo && (
                  <span className={styles.shot}>
                    <Photo
                      className={styles.photo}
                      src={photo}
                      alt=""
                      sizes={PICKS_PHOTO_SIZES}
                    />
                    {itemTags.length > 0 && (
                      <span className={styles.stickers}>
                        {itemTags.map((name) => (
                          <span
                            key={name}
                            className={styles.sticker}
                          >
                            {typograph(name)}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                )}
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
          );
        })}
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
