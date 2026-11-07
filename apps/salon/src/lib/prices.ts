import { SERVICE_CATEGORIES } from '../cms/seed/data';
import type { PriceGroup, Service } from '../types';

/**
 * Группы прайса в порядке направлений; направление без услуг не выводится — пустой группы на странице нет.
 * `only` — направления мастера: его страница показывает только их.
 */
export const priceGroups = (services: Service[], only?: string[]): PriceGroup[] =>
  SERVICE_CATEGORIES.filter(({ slug }) => !only || only.includes(slug))
    .map((category) => ({ ...category, services: services.filter((service) => service.category === category.slug) }))
    .filter(({ services: list }) => list.length > 0);
