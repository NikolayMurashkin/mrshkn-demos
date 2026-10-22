import { MENU } from '../../consts';
import { filterMenu, menuHref, parseMenuFilter } from '../../lib/menu';
import type { MenuItem, MenuOption, SearchParams } from '../../types';
import { MenuBoard } from '../MenuBoard';
import { MenuChips } from '../MenuChips';
import { QrBar } from '../QrBar';
import { SiteHeader } from '../SiteHeader';
import { SitePlate } from '../SitePlate';
import styles from './MenuScreen.module.scss';

type MenuScreenProps = {
  items: MenuItem[];
  categories: MenuOption[];
  tags: MenuOption[];
  searchParams: SearchParams;
};

/**
 * Экран меню целиком. Шапка — здесь, а не в layout: layout не видит адреса, а по QR-коду (`qr=1`) гость у стойки
 * получает компактный вид — без шапки, головки и плиты, чтобы ни одна ссылка не увела его с меню.
 */
export const MenuScreen = ({ items, categories, tags, searchParams }: MenuScreenProps) => {
  const view = parseMenuFilter(searchParams);
  const visible = filterMenu(items, view);
  const resetHref = menuHref({ tags: [], qr: view.qr });
  const chips = (
    <MenuChips
      categories={categories}
      tags={tags}
      view={view}
    />
  );

  if (view.qr) {
    return (
      <main className={styles.compact}>
        <h1 className={styles.compactTitle}>{MENU.compactTitle}</h1>
        <QrBar>{chips}</QrBar>
        <div className={styles.list}>
          <MenuBoard
            items={visible}
            categories={categories}
            tags={tags}
            resetHref={resetHref}
            single
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <SiteHeader current="menu" />
      <main className={styles.page}>
        <div className={styles.head}>
          <div className={styles.intro}>
            <h1 className={styles.title}>{MENU.title}</h1>
            <p className={styles.note}>{MENU.note}</p>
          </div>
          {chips}
        </div>
        <MenuBoard
          items={visible}
          categories={categories}
          tags={tags}
          resetHref={resetHref}
        />
      </main>
      <SitePlate />
    </>
  );
};
