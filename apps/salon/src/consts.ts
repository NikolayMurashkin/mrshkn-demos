import { NBSP } from '@mrshkn/demo-core/consts';
import { typograph } from '@mrshkn/demo-core/typograph';
import type { MasterWork, NavItem, PhotoFrame } from './types';

/** Знак салона в шапке и подвале: название Dela и вид дела подписью; название не рвется на две строки. */
export const SALON = {
  name: `Капля${NBSP}лака`,
  kind: typograph('салон красоты'),
  address: typograph('Калининград, Лаковый переулок, 3'),
  hours: typograph('Ежедневно с 10:00 до 21:00'),
};

export const BOOKING_HREF = '/booking';

/** Якорь формы заявки на странице записи: туда ведет запись, пока у салона нет бота. */
export const BOOKING_FORM_ID = 'booking-form';

export const BOOKING_FORM_HREF = `${BOOKING_HREF}#${BOOKING_FORM_ID}`;

export const BOOKING_CTA = 'Записаться';

export const NAV_LABEL = 'Разделы сайта';

export const PRICES_HREF = '/prices';

export const MASTERS_HREF = '/masters';

export const REVIEWS_HREF = '/reviews';

export const CONTACTS_HREF = '/contacts';

export const NAV: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: PRICES_HREF, label: typograph('Услуги и цены') },
  { href: MASTERS_HREF, label: 'Мастера' },
  { href: REVIEWS_HREF, label: 'Отзывы' },
  { href: CONTACTS_HREF, label: 'Контакты' },
];

/** Подпись под кнопкой записи — только когда кнопка ведет в бота. */
export const BOT_NOTE = typograph('Откроется бот салона в Telegram: выберите услугу, мастера и свободное время.');

export const HERO = {
  title: typograph('Маникюр, брови, ресницы и волосы в одном салоне'),
  lead: typograph(
    'Пять мастеров в центре Калининграда. Цены — на сайте, запись — онлайн за минуту, в любое время суток.',
  ),
  prices: typograph('Услуги и цены'),
  facts: [
    typograph('Инструменты стерилизуем в сухожаре, пилки — одноразовые'),
    typograph('Цена в прайсе — та же, что на кассе'),
    typograph('Напомним о записи за день'),
  ],
};

export const HOME = {
  servicesTitle: typograph('Услуги и цены'),
  servicesNote: typograph('Цены — от: точную стоимость мастер назовет до начала работы'),
  mastersTitle: 'Мастера',
  mastersAll: 'Все мастера',
  reviewsTitle: 'Отзывы',
  reviewsAll: 'Все отзывы',
};

/** Мастеров на главной — одна строка сетки, остальные на `/masters`. */
export const HOME_MASTERS = 4;

/** Отзывов на главной — одна строка сетки, остальные на `/reviews`. */
export const HOME_REVIEWS = 3;

/** Плита над подвалом: с ботом — выбор времени в нем, без бота — заявка администратору. */
export const PLATE = {
  bot: typograph('Выберите время онлайн — без звонков'),
  form: typograph('Оставьте заявку — подберем время и мастера'),
};

export const PRICES_PAGE = {
  title: typograph('Услуги и цены'),
  lead: HOME.servicesNote,
  empty: typograph('Прайс обновляется: цены назовет администратор при записи.'),
  description: 'Прайс салона «Капля лака»: маникюр, педикюр, брови, ресницы, стрижки, окрашивание и макияж — цены от.',
};

export const MASTERS_PAGE = {
  title: 'Мастера',
  lead: typograph('Пять мастеров — у каждого своя специализация. Запись — к мастеру, которого вы выберете.'),
  description: 'Мастера салона «Капля лака»: маникюр, брови и ресницы, окрашивание, макияж.',
  empty: typograph('Список мастеров обновляется: при записи администратор подберет свободного.'),
};

export const MASTER_PAGE = {
  back: 'Все мастера',
  works: 'Работы',
  reviews: 'Отзывы',
};

export const REVIEWS_PAGE = {
  title: 'Отзывы',
  lead: typograph('Что пишут гости после визита.'),
  description: 'Отзывы гостей салона «Капля лака» о мастерах и услугах.',
  empty: typograph('Отзывов пока нет.'),
};

export const CONTACTS_PAGE = {
  title: 'Контакты',
  description: 'Адрес и часы работы салона «Капля лака» в Калининграде, как добраться, карта.',
  address: 'Адрес',
  hours: 'Часы работы',
  how: 'Как добраться',
  howText: typograph(
    'Вход со двора, первый этаж, над дверью — вывеска с розовой каплей. Во дворе можно оставить машину бесплатно.',
  ),
  write: typograph('Написать в Telegram'),
  mapLabel: 'Салон «Капля лака» на карте',
  photo: 'salon-interior',
  photoAlt: typograph('Зал салона: круглые зеркала, кресла мастеров и неоновая надпись на стене'),
} as const;

export const BOOKING_PAGE = {
  title: 'Запись',
  description: 'Запись в салон «Капля лака»: заявка администратору онлайн.',
  bot: {
    lead: typograph('В боте салона быстрее: свободное время мастеров видно сразу, напоминание придет за день.'),
    title: 'Через Telegram',
  },
  form: {
    lead: typograph('Напишите, на какую услугу и когда удобно прийти, — остальное администратор возьмет на себя.'),
    title: 'Без Telegram',
    titleAlone: typograph('Заявка на запись'),
    note: typograph(
      'Оставьте заявку — администратор напишет или позвонит в течение часа в часы работы салона и подберет время.',
    ),
  },
};

export const PRIVACY_PAGE = {
  title: 'Политика обработки персональных данных',
};

/** Вид плиты без кадра: капли стоят по-разному у соседних карточек. */
export const MASTER_PHOTO_VARIANTS = ['a', 'b', 'c'] as const;

/**
 * Рамки кадров — как `aspect-ratio` в SCSS: портрет мастера (карточка и страница мастера), снимок работы, фото салона.
 * По ним `sizes` кадра шире рамки — ширина отрисовки `cover` (`coverSizes`), а `*_SIZES` ниже — ширина рамки.
 */
export const MASTER_PHOTO_FRAME: PhotoFrame = { width: 3, height: 4 };

export const WORK_PHOTO_FRAME: PhotoFrame = { width: 1, height: 1 };

export const CONTACTS_PHOTO_FRAME: PhotoFrame = { width: 16, height: 9 };

/** Ширина портрета мастера в сетке 4 → 3 → 2 → 1 колонки (поле страницы и зазоры — с запасом). */
export const MASTER_CARD_PHOTO_SIZES =
  '(max-width: 480px) 100vw, (max-width: 720px) 50vw, (max-width: 1080px) 33vw, 25vw';

/** Портрет на странице мастера: 4 колонки из 12, на ≤ 1080 — 240 px. */
export const MASTER_PORTRAIT_SIZES = '(max-width: 1080px) 240px, 33vw';

/** «Работы» на странице мастера: 3 → 2 (≤ 720) → 1 (≤ 480) колонки во всю ширину страницы. */
export const WORK_PHOTO_SIZES = '(max-width: 480px) 100vw, (max-width: 720px) 50vw, 33vw';

/** Фото салона под картой: 7 колонок из 12, на ≤ 1080 — во всю ширину страницы. */
export const CONTACTS_PHOTO_SIZES = '(max-width: 1080px) 100vw, 58vw';

/**
 * Снимки работ мастера по коду мастера из засева: три кадра 1:1, подпись — что в кадре. Мастер с другим кодом
 * (новый в админке) остается без раздела «Работы». `top` — важное у верхнего края кадра, кадрирование от него.
 */
export const MASTER_WORKS: Record<string, MasterWork[]> = {
  alina: [
    { photo: 'work-alina-1', alt: typograph('Маникюр: сиреневый, белый и блестки') },
    { photo: 'work-alina-2', alt: typograph('Маникюр: белые ногти с мраморными кончиками'), focus: 'top' },
    { photo: 'work-alina-3', alt: typograph('Педикюр: синий гель-лак') },
  ],
  daria: [
    { photo: 'work-daria-1', alt: typograph('Брови после укладки крупным планом'), focus: 'top' },
    { photo: 'work-daria-2', alt: typograph('Наращенные ресницы, объем') },
    { photo: 'work-daria-3', alt: typograph('Ресницы и карий глаз крупным планом') },
  ],
  marina: [
    { photo: 'work-marina-1', alt: typograph('Окрашивание: пепельные локоны') },
    { photo: 'work-marina-2', alt: typograph('Окрашивание: каре с медными прядями') },
    { photo: 'work-marina-3', alt: typograph('Светлые кудри после укладки') },
  ],
  eva: [
    { photo: 'work-eva-1', alt: typograph('Макияж: стрелки и сияющая кожа'), focus: 'top' },
    { photo: 'work-eva-2', alt: typograph('Визажист наносит помаду кисточкой') },
    { photo: 'work-eva-3', alt: typograph('Свадебный макияж: невеста улыбается'), focus: 'top' },
  ],
  olga: [
    { photo: 'work-olga-1', alt: typograph('Маникюр: листья и леопардовый рисунок') },
    { photo: 'work-olga-2', alt: typograph('Маникюр: черный и «черепаховый» лак') },
    { photo: 'work-olga-3', alt: typograph('Маникюр: разноцветный дизайн') },
  ],
};

/** CSS-переменная на `:root` с фактической высотой шапки: от нее отступ якорей. */
export const HEADER_HEIGHT_VAR = '--n-header-real';
