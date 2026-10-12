export type NavItem = {
  href: string;
  label: string;
  /** Раздел сайта: пункт текущий на любой странице, адрес которой начинается с него. Пункт-якорь текущим не бывает. */
  section?: string;
};

export type LinkItem = {
  href: string;
  label: string;
};

export type LogLine = {
  /** Доля пользователей на этом шаге раскатки; пусто — шаг без процента. */
  stage: string;
  key: string;
  text: string;
  status: 'ok' | 'active';
};

export type Feature = {
  title: string;
  text: string;
  command: string;
};

export type Plan = {
  id: string;
  name: string;
  summary: string;
  /** Цена в рублях; 0 — тариф бесплатный, цена не пишется. */
  amount: number;
  /** Цена «от»: итог зависит от числа команд. */
  from: boolean;
  term: string;
  points: string[];
  cta: string;
  /** Тариф, который студия выделяет рамкой accent: без подписи «популярный» — данных о выборе нет. */
  accent?: boolean;
};

export type Release = {
  version: string;
  /** Дата релиза в ISO для `<time>`. */
  date: string;
  dateText: string;
  title: string;
  items: string[];
};

export type DocSection = {
  id: string;
  title: string;
  text: string[];
  code?: string;
};

export type DocPage = {
  slug: string;
  title: string;
  lead: string;
  sections: DocSection[];
};
