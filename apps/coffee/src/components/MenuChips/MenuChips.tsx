import { typograph } from '@mrshkn/demo-core/typograph';
import { MENU } from '../../consts';
import { menuHref, toggleTag } from '../../lib/menu';
import type { MenuOption, MenuView } from '../../types';
import styles from './MenuChips.module.scss';

type MenuChipsProps = {
  categories: MenuOption[];
  tags: MenuOption[];
  view: MenuView;
};

/**
 * Фильтр меню — ссылки, а не кнопки: состояние живет в адресе, список фильтрует сервер, клиентского JS нет.
 * В компактном виде на узком экране — одна строка с прокруткой вбок: девять чипов переносом заняли бы пол-экрана.
 * Категория одна («Все меню» — без категории), признаки складываются по И; ссылка чипа сохраняет остальной фильтр.
 */
export const MenuChips = ({ categories, tags, view }: MenuChipsProps) => (
  <div className={view.qr ? `${styles.filter} ${styles.compact}` : styles.filter}>
    <ul
      className={styles.chips}
      aria-label={MENU.categories}
    >
      <li>
        <a
          className={styles.chip}
          href={menuHref({ ...view, category: undefined })}
          aria-current={view.category ? undefined : 'true'}
        >
          {MENU.all}
        </a>
      </li>
      {categories.map(({ slug, name }) => (
        <li key={slug}>
          <a
            className={styles.chip}
            href={menuHref({ ...view, category: slug })}
            aria-current={view.category === slug ? 'true' : undefined}
          >
            {typograph(name)}
          </a>
        </li>
      ))}
    </ul>
    <ul
      className={`${styles.chips} ${styles.tags}`}
      aria-label={MENU.tags}
    >
      {tags.map(({ slug, name }) => (
        <li key={slug}>
          <a
            className={`${styles.chip} ${styles.tag}`}
            href={menuHref({ ...view, tags: toggleTag(view.tags, slug) })}
            aria-current={view.tags.includes(slug) ? 'true' : undefined}
          >
            {typograph(name)}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
