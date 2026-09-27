import type { DemoReview } from '@mrshkn/demo-core/types';

export type SeedPrice = {
  name: string;
  price: number;
  /** Цена «от»: итог зависит от клинической картины. */
  from?: boolean;
};

export type SeedService = {
  slug: string;
  title: string;
  summary: string;
  /** Цена в списке услуг: самое частое лечение, а не консультация или анестезия. */
  priceFrom: number;
  /** Абзацы через пустую строку. */
  description: string;
  prices: SeedPrice[];
};

export type SeedDoctor = {
  slug: string;
  name: string;
  position: string;
  practiceSince: number;
  /** Абзацы через пустую строку. */
  about: string;
  education: string[];
  /** Адреса услуг, которые ведет врач. */
  services: string[];
};

export type SeedReview = DemoReview;
