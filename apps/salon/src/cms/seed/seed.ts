import type { Payload } from 'payload';
import type { Master as MasterDoc, Service as ServiceDoc } from '../../payload-types';
import { MASTERS_COLLECTION, REVIEWS_COLLECTION, SERVICES_COLLECTION } from '../consts';
import { MASTERS, REVIEWS, SERVICES } from './data';

const isEmpty = async (payload: Payload, collection: typeof MASTERS_COLLECTION | typeof SERVICES_COLLECTION) =>
  (await payload.count({ collection })).totalDocs === 0;

/**
 * Вымышленный салон попадает в пустую базу при старте — на стенде, в разработке и под Lighthouse, без ручного
 * импорта. Каждая коллекция засевается, только пока пуста: правки из админки не перезаписываются. Направления
 * засева — из тех же констант, что варианты полей, поэтому приведение типа безопасно. Отзыв ссылается на мастера
 * по коду: мастера засеваются раньше.
 */
export const seedSalon = async (payload: Payload) => {
  if (await isEmpty(payload, SERVICES_COLLECTION)) {
    for (const { category, ...service } of SERVICES) {
      await payload.create({
        collection: SERVICES_COLLECTION,
        data: { ...service, category: category as ServiceDoc['category'] },
      });
    }
  }

  if (await isEmpty(payload, MASTERS_COLLECTION)) {
    for (const { categories, ...master } of MASTERS) {
      await payload.create({
        collection: MASTERS_COLLECTION,
        data: { ...master, categories: categories as MasterDoc['categories'] },
      });
    }
  }

  if ((await payload.count({ collection: REVIEWS_COLLECTION })).totalDocs > 0) {
    return;
  }

  const { docs: masters } = await payload.find({ collection: MASTERS_COLLECTION, limit: 0, depth: 0 });
  const masterId = new Map(masters.map(({ slug, id }) => [slug, id]));

  for (const { master, ...review } of REVIEWS) {
    await payload.create({ collection: REVIEWS_COLLECTION, data: { ...review, master: masterId.get(master) } });
  }
};
