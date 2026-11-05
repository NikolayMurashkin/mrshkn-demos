import type { DemoLang } from '@mrshkn/demo-core/types';
import type { PhotoKey } from './assets/photos/keys';
import type { Ticket } from './types';

/** Языки демо: первый — язык по умолчанию, на него ведут `/` и `/privacy`. */
export const LANGS: DemoLang[] = ['ru', 'en'];

export const DEFAULT_LANG: DemoLang = 'ru';

export const LANG_CODES: Record<DemoLang, string> = { ru: 'RU', en: 'EN' };

/** Концерт вымышленный, своей страницы на Афише у него нет: кнопки «Купить билет» ведут на афишу города. */
export const AFISHA_URL = 'https://afisha.yandex.ru/kaliningrad';

/** Ссылка на чужой сайт — в новой вкладке, без доступа к этой странице через `window.opener`. */
export const EXTERNAL_LINK = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Категории билетов по возрастанию цены, рубли. */
export const TICKETS: Ticket[] = [
  { id: 'balcony', price: 1500 },
  { id: 'parterre', price: 2500 },
  { id: 'front', price: 3500 },
];

/** Концерт идет в Калининграде: день недели, «сегодня» и время начала считаются по его поясу, а не по поясу сервера. */
export const TIME_ZONE = 'Europe/Kaliningrad';

/**
 * Дата концерта скользит: суббота не раньше чем через три недели от сегодняшнего дня по Калининграду — сайт всегда
 * показывает ближайший концерт, до которого еще есть время купить билет.
 */
export const CONCERT = {
  weekday: 6,
  minDaysAhead: 21,
  startHour: 19,
};

export const DATE_LOCALES: Record<DemoLang, string> = { ru: 'ru-RU', en: 'en-US' };

/** Цена в рублях на обоих языках: билеты продаются в Калининграде, английская версия только переводит страницу. */
export const PRICE_LOCALES: Record<DemoLang, string> = { ru: 'ru-RU', en: 'en-US' };

/** Длина окружности кольца бейджа первого экрана (r = 100): текст кольца растягивается на нее целиком, без зазора. */
export const RING_LENGTH = 628;

/**
 * Сколько раз повторяется набор пунктов ленты: лента сдвигается на половину дорожки, и половина должна быть не меньше
 * двух ширин окна до 3840 px (7680 px), иначе в конце цикла виден шов. Самый короткий набор — en с датой
 * «Saturday, May 1», 1172 px кеглем 24 px: 7 наборов в половине — 8204 px.
 */
export const TAPE_REPEAT = 14;

/** Галерея «С прошлых концертов» по порядку: стоковые кадры джазового вечера. */
export const GALLERY: PhotoKey[] = [
  'gallery-stage',
  'gallery-piano',
  'gallery-bass',
  'gallery-drums',
  'gallery-saxophones',
  'gallery-silhouettes',
];

/**
 * Ширина отрисованного кадра для `sizes`: кадр заполняет рамку (`object-fit: cover`), и у кадра 3:2 в рамке другой
 * пропорции видимая ширина больше ширины рамки. Рамки — в SCSS компонентов.
 */
export const PHOTO_SIZES = {
  poster: '(max-width: 1080px) 100vw, 800px',
  half: '(max-width: 1080px) 100vw, 50vw',
  gallery: '(max-width: 1080px) 60vw, 40vw',
};
