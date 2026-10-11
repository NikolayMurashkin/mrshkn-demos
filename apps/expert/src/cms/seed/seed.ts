import type { Payload } from 'payload';
import { ARTICLES, FORMATS } from './data';
import { lexicalFromSections } from './lexical';

const isEmpty = async (payload: Payload, collection: 'formats' | 'articles') =>
  (await payload.count({ collection })).totalDocs === 0;

/**
 * Вымышленный контент психолога попадает в пустую базу при старте — на стенде, в разработке, под Lighthouse и в e2e,
 * без ручного импорта. Каждая коллекция засевается, только пока в ней пусто: правки из админки не перезаписываются.
 */
export const seedExpert = async (payload: Payload) => {
  if (await isEmpty(payload, 'formats')) {
    for (const format of FORMATS) {
      await payload.create({ collection: 'formats', data: format });
    }
  }

  if (await isEmpty(payload, 'articles')) {
    for (const { sections, ...article } of ARTICLES) {
      await payload.create({
        collection: 'articles',
        data: { ...article, content: lexicalFromSections(sections) as never },
      });
    }
  }
};
