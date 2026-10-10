import type { Payload } from 'payload';
import { NODES, REVIEWS, SYMPTOMS } from './data';

type SeedCollection = 'nodes' | 'symptoms' | 'reviews';

const isEmpty = async (payload: Payload, collection: SeedCollection) =>
  (await payload.count({ collection })).totalDocs === 0;

/**
 * Вымышленный контент автосервиса попадает в пустую базу при старте — на стенде, в разработке и под Lighthouse,
 * без ручного импорта. Документ создается на русском и дополняется английским; каждая коллекция засевается,
 * только пока в ней пусто: правки из админки не перезаписываются.
 */
export const seedAuto = async (payload: Payload) => {
  if (await isEmpty(payload, 'nodes')) {
    for (const { key, content } of NODES) {
      const { id } = await payload.create({ collection: 'nodes', locale: 'ru', data: { key, ...content.ru } });

      await payload.update({ collection: 'nodes', id, locale: 'en', data: content.en });
    }
  }

  if (await isEmpty(payload, 'symptoms')) {
    const { docs: nodes } = await payload.find({ collection: 'nodes', limit: 0, depth: 0 });
    const nodeIds = new Map(nodes.map(({ key, id }) => [key, id]));

    for (const { key, node, place, text } of SYMPTOMS) {
      const nodeId = nodeIds.get(node);

      if (nodeId === undefined) {
        continue;
      }

      const { id } = await payload.create({
        collection: 'symptoms',
        locale: 'ru',
        data: { key, node: nodeId, place, text: text.ru },
      });

      await payload.update({ collection: 'symptoms', id, locale: 'en', data: { text: text.en } });
    }
  }

  if (await isEmpty(payload, 'reviews')) {
    for (const review of REVIEWS) {
      const { id } = await payload.create({ collection: 'reviews', locale: 'ru', data: review.ru });

      await payload.update({ collection: 'reviews', id, locale: 'en', data: review.en });
    }
  }
};
