import type { Payload } from 'payload';
import type { MenuItem as MenuItemDoc } from '../../payload-types';
import { MENU_ITEMS_COLLECTION } from '../consts';
import { MENU_ITEMS } from './data';

/**
 * Вымышленное меню попадает в пустую базу при старте — на стенде, в разработке и под Lighthouse, без ручного
 * импорта. Категории и признаки засева — из тех же констант, что варианты полей, поэтому приведение типа безопасно
 * (засев сторожит unit-тест меню). Засев идет, только пока коллекция пуста: правки из админки не перезаписываются.
 */
export const seedCoffee = async (payload: Payload) => {
  if ((await payload.count({ collection: MENU_ITEMS_COLLECTION })).totalDocs > 0) {
    return;
  }

  for (const { category, tags, ...item } of MENU_ITEMS) {
    await payload.create({
      collection: MENU_ITEMS_COLLECTION,
      data: {
        ...item,
        category: category as MenuItemDoc['category'],
        tags: tags as NonNullable<MenuItemDoc['tags']>,
      },
    });
  }
};
