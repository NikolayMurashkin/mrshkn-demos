import type { PhotoKey } from './assets/photos/keys';

/** Направление салона: группа прайса, плитка главной и специализация мастера. */
export type ServiceCategory = {
  slug: string;
  name: string;
  /** Одна фраза о направлении: под названием плитки и группы прайса. */
  text: string;
};

export type Service = {
  slug: string;
  name: string;
  category: string;
  /** Длительность словами: «60 мин», «1 ч 45 мин». */
  duration: string;
  /** Цена «от», целые рубли. */
  price: number;
};

export type Master = {
  slug: string;
  name: string;
  /** Имя в дательном падеже для кнопки «Записаться к …»; пусто — кнопка без имени. */
  nameDative?: string;
  role: string;
  years: number;
  about: string;
  categories: string[];
  photo?: string;
};

export type Review = {
  author: string;
  text: string;
  /** Услуга, о которой отзыв: «маникюр». */
  subject?: string;
  /** Мастер отзыва; пусто — отзыв о салоне. */
  master?: Pick<Master, 'slug' | 'name'>;
};

export type SeedReview = Omit<Review, 'master'> & { master: string };

export type NavItem = {
  href: string;
  label: string;
};

/** Группа прайса: направление и его услуги в порядке из админки. */
export type PriceGroup = ServiceCategory & { services: Service[] };

/** Снимок работы мастера: ключ кадра, подпись — что в кадре; `top` — кадрировать от верхнего края. */
export type MasterWork = {
  photo: PhotoKey;
  alt: string;
  focus?: 'top';
};

/** Пропорция кадра или его рамки: ширина и высота (как `aspect-ratio` в SCSS или размеры файла). */
export type PhotoFrame = {
  width: number;
  height: number;
};
