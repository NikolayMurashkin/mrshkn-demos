/** Позиция меню: цена — целые рубли, категория и признаки — slug из констант засева. */
export type MenuItem = {
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
};

/** Категория или признак меню: slug для адреса и название для чипа. */
export type MenuOption = {
  slug: string;
  name: string;
};

export type MenuFilter = {
  category?: string;
  tags: string[];
};

/** Фильтр из адреса `/menu?category=…&tag=…&qr=1`: `qr` — компактный вид для гостя у стойки. */
export type MenuView = MenuFilter & { qr: boolean };

export type SearchParams = Record<string, string | string[] | undefined>;

export type NavItem = {
  href: string;
  label: string;
  /** Страница, на которой пункт текущий; якорь главной текущим не бывает. */
  page?: SitePage;
};

/** Страница шапки, отмеченная как текущая. */
export type SitePage = 'menu' | 'loyalty';

export type HoursRow = {
  days: string;
  time: string;
};

/** Переменная окружения с адресом Mini App у бота, подпись его кнопки и имя мессенджера для заголовка. */
export type LoyaltyAppEnv = {
  name: string;
  label: string;
  messenger: string;
};

/** Кнопка Mini App «Лояльность» на странице `/loyalty`. */
export type LoyaltyApp = {
  href: string;
  label: string;
  messenger: string;
};
