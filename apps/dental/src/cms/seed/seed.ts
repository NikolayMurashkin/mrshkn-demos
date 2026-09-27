import type { Payload } from 'payload';
import { DOCTORS, REVIEWS, SERVICES } from './data';

const isEmpty = async (payload: Payload, collection: 'services' | 'doctors' | 'reviews') =>
  (await payload.count({ collection })).totalDocs === 0;

/**
 * Вымышленный контент клиники попадает в пустую базу при старте — на стенде, в разработке и под Lighthouse, без
 * ручного импорта. Каждая коллекция засевается, только пока в ней пусто: правки из админки не перезаписываются.
 */
export const seedClinic = async (payload: Payload) => {
  if (await isEmpty(payload, 'services')) {
    for (const service of SERVICES) {
      await payload.create({ collection: 'services', data: service });
    }
  }

  if (await isEmpty(payload, 'doctors')) {
    const { docs: services } = await payload.find({ collection: 'services', limit: 0, depth: 0 });
    const serviceIds = new Map(services.map(({ slug, id }) => [slug, id]));

    for (const { education, services: slugs, ...doctor } of DOCTORS) {
      await payload.create({
        collection: 'doctors',
        data: {
          ...doctor,
          education: education.map((item) => ({ item })),
          services: slugs.flatMap((slug) => serviceIds.get(slug) ?? []),
        },
      });
    }
  }

  if (await isEmpty(payload, 'reviews')) {
    for (const review of REVIEWS) {
      await payload.create({ collection: 'reviews', data: review });
    }
  }
};
