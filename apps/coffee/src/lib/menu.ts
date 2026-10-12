import { MENU_CATEGORIES, MENU_TAGS } from '../cms/seed/data';
import { MENU_HREF } from '../consts';
import type { MenuFilter, MenuItem, MenuOption, MenuView, SearchParams } from '../types';

const CATEGORY_SLUGS = new Set(MENU_CATEGORIES.map(({ slug }) => slug));

const TAG_SLUGS = new Set(MENU_TAGS.map(({ slug }) => slug));

/** Позиции категории и всех выбранных признаков (И), в исходном порядке; исходный массив не меняется. */
export const filterMenu = (items: MenuItem[], { category, tags }: MenuFilter): MenuItem[] =>
  items.filter((item) => (!category || item.category === category) && tags.every((tag) => item.tags.includes(tag)));

const valuesOf = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

/**
 * Фильтр из адреса. Неизвестные категория и признаки отбрасываются: ссылка с мусором показывает все меню, а не
 * пустой список. Компактный вид — только по точному `qr=1`.
 */
export const parseMenuFilter = (searchParams: SearchParams): MenuView => {
  const [category] = valuesOf(searchParams.category);
  const tags = [...new Set(valuesOf(searchParams.tag))].filter((tag) => TAG_SLUGS.has(tag));

  return {
    category: category && CATEGORY_SLUGS.has(category) ? category : undefined,
    tags,
    qr: valuesOf(searchParams.qr)[0] === '1',
  };
};

/** Адрес меню с фильтром: чипы и сброс собирают его из текущего фильтра, `qr=1` переносится в каждую ссылку. */
export const menuHref = ({ category, tags, qr }: MenuView) => {
  const params = new URLSearchParams();

  if (category) {
    params.set('category', category);
  }

  for (const tag of tags) {
    params.append('tag', tag);
  }

  if (qr) {
    params.set('qr', '1');
  }

  const query = params.toString();

  return query ? `${MENU_HREF}?${query}` : MENU_HREF;
};

/** Признак в ссылке чипа: выбранный снимается, невыбранный добавляется к остальным. */
export const toggleTag = (tags: string[], tag: string) =>
  tags.includes(tag) ? tags.filter((selected) => selected !== tag) : [...tags, tag];

/** Позиции по категориям в порядке категорий; категории без позиций не выводятся. */
export const groupMenu = (items: MenuItem[], categories: MenuOption[]) =>
  categories
    .map((category) => ({ category, items: items.filter((item) => item.category === category.slug) }))
    .filter((group) => group.items.length > 0);

/** Первая позиция каждой категории по порядку засева — «Что взять» на главной. */
export const firstOfEachCategory = (items: MenuItem[], categories: MenuOption[]) =>
  groupMenu(items, categories).map(({ category, items: [first] }) => ({ category, item: first }));
