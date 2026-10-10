import type { DemoLang, DemoReview } from '@mrshkn/demo-core/types';
import type { Payload } from 'payload';
import type { AutoNode, AutoSymptom, WhereItHurts } from './types';

/**
 * «Где болит» на одном языке: узлы с причинами и симптомы, ссылка симптома — `key` узла. Чтение без кеша между
 * запросами: правка в админке видна со следующей загрузки.
 */
export const getWhereItHurts = async (payload: Payload, lang: DemoLang): Promise<WhereItHurts> => {
  const [{ docs: nodeDocs }, { docs: symptomDocs }] = await Promise.all([
    payload.find({ collection: 'nodes', locale: lang, sort: '_order', limit: 0, depth: 0 }),
    payload.find({ collection: 'symptoms', locale: lang, sort: '_order', limit: 0, depth: 0 }),
  ]);
  const keys = new Map(nodeDocs.map(({ id, key }) => [id, key]));

  const nodes: AutoNode[] = nodeDocs.map(({ key, name, causes }) => ({
    key,
    name: name ?? '',
    causes: (causes ?? []).map(({ text, price, term }) => ({ text, price, term })),
  }));

  const symptoms: AutoSymptom[] = symptomDocs.flatMap(({ key, node, text }) => {
    const nodeKey = keys.get(typeof node === 'object' ? node.id : node);

    return nodeKey ? [{ key, node: nodeKey, text: text ?? '' }] : [];
  });

  return { nodes, symptoms };
};

/** Отзывы на языке страницы: без текста или подписи на этом языке отзыв не показывается. */
export const getReviews = async (payload: Payload, lang: DemoLang): Promise<DemoReview[]> => {
  const { docs } = await payload.find({ collection: 'reviews', locale: lang, sort: 'createdAt', limit: 0, depth: 0 });

  return docs.flatMap(({ author, text, subject }) => (author && text ? [{ author, text, subject }] : []));
};
