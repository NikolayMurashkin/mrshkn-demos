import type { Payload } from 'payload';
import { cache } from 'react';
import type { MenuItem } from '../types';
import { MENU_ITEMS_COLLECTION } from './consts';

/**
 * Меню в порядке из админки. Payload — аргументом: страница передает свой экземпляр, тест — экземпляр на тестовой
 * базе. Кеша между запросами нет: правка в админке видна со следующей загрузки.
 */
export const getMenuItems = cache(async (payload: Payload): Promise<MenuItem[]> => {
  const { docs } = await payload.find({ collection: MENU_ITEMS_COLLECTION, sort: '_order', limit: 0, depth: 0 });

  return docs.map(({ slug, name, description, price, category, tags }) => ({
    slug,
    name,
    description: description ?? undefined,
    price,
    category,
    tags: tags ?? [],
  }));
});
