import { STUDIO_NAME, STUDIO_URL } from '@mrshkn/demo-core/consts';
import type { LoyaltyAppEnv, NavItem } from './types';

/** Знак в шапке, подвале, на карте-штампе и плакате: короткое имя заведения на желтой метке. */
export const BRAND = { name: 'Гуща', kind: 'кофейня' };

export const MENU_HREF = '/menu';

/** Страница «Лояльность»: кнопки Mini App у ботов кофейни, без адресов ботов — заглушка. */
export const LOYALTY_HREF = '/loyalty';

export const LOYALTY_LABEL = 'Лояльность';

export const NAV: NavItem[] = [
  { href: MENU_HREF, label: 'Меню', page: 'menu' },
  { href: '/#contacts', label: 'Как найти' },
];

export const HERO = {
  title: 'Кофе на углу Галицкого',
  lead: 'Варим с 8 утра, печем каждое утро. Возьмите с собой или садитесь у окна.',
  menu: 'Меню',
  contacts: 'Как найти',
  stickers: {
    opens: 'с 8:00',
    oat: 'овсяное — без доплаты',
    loyalty: '10-я чашка — от нас',
  },
};

export const PICKS = {
  title: 'Что взять',
  all: 'Все меню',
};

export const VISIT = {
  title: 'Как найти',
  address: 'Адрес',
  phone: 'Телефон',
  hours: 'Часы работы',
  map: `${BRAND.name} на карте`,
};

export const PLATE = {
  title: 'Копите чашки в Telegram и MAX',
};

export const MENU = {
  title: 'Меню',
  note: 'овсяное — без доплаты',
  compactTitle: 'Меню «Гущи»',
  all: 'Все меню',
  categories: 'Категории',
  tags: 'Признаки',
  empty: 'Такого сочетания нет. Снимите один из признаков.',
  reset: 'Показать все меню',
};

const LOYALTY_LEAD = 'Каждая 10-я чашка — от нас. Штампы ставит бариста по QR в приложении.';

const LOYALTY_SOON = 'Приложение запускаем — загляните позже.';

const LOYALTY_TITLE = 'Карта лояльности';

/**
 * `text` — заглушка, пока у кофейни нет ни одного бота; `lead` — тот же текст без «загляните позже», рядом с кнопками.
 * Заголовок и описание называют мессенджеры с заданным ботом, перечисленные через `and`.
 */
export const LOYALTY = {
  title: LOYALTY_TITLE,
  heading: (messengers: string) => `${LOYALTY_TITLE} — в ${messengers}`,
  description: (messengers: string) => `Каждая 10-я чашка — от нас. ${LOYALTY_TITLE} в ${messengers}.`,
  and: ' и ',
  lead: LOYALTY_LEAD,
  text: `${LOYALTY_LEAD} ${LOYALTY_SOON}`,
  telegram: 'Открыть в Telegram',
  max: 'Открыть в MAX',
  back: 'Вернуться в меню',
};

/** Адрес бота без https — не кнопка: `javascript:`, `#`, `http://` на странице не появятся. */
export const LOYALTY_APP_URL_PREFIX = 'https://';

/** Адрес Mini App у бота (`https://t.me/<бот>?startapp`, `https://max.ru/<бот>?startapp`) — из окружения стенда. */
export const LOYALTY_APP_ENV: LoyaltyAppEnv[] = [
  { name: 'LOYALTY_TELEGRAM_URL', label: LOYALTY.telegram, messenger: 'Telegram' },
  { name: 'LOYALTY_MAX_URL', label: LOYALTY.max, messenger: 'MAX' },
];

/** Девять пустых ячеек карты-штампа и десятая — подарок. */
export const STAMP_CELLS = Array.from({ length: 9 }, (_, index) => index);

/** У плаката нет подвала демо: подпись вымысла — последней строкой листа, на экране и в печати. */
export const POSTER = {
  title: 'Меню — по QR',
  hint: 'Распечатайте на A4',
  print: 'Печать',
  demo: `Демо-проект студии ${STUDIO_NAME} · ${new URL(STUDIO_URL).host}`,
};

/** Дни недели schema.org → подпись в таблице часов. */
export const WEEKDAYS: Record<string, string> = {
  Mo: 'пн',
  Tu: 'вт',
  We: 'ср',
  Th: 'чт',
  Fr: 'пт',
  Sa: 'сб',
  Su: 'вс',
};

/** Звезда-стикер DS Pop: метка на карте, подарок на карте-штампе, угол плаката. */
export const STAR_PATH = 'M12 2l2.4 6.6L21 9.3l-5.2 4.3 1.7 6.9L12 16.9l-5.5 3.6 1.7-6.9L3 9.3l6.6-.7z';
