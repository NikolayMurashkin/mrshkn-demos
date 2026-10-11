import config from '@payload-config';
import { getPayload } from 'payload';
import { cache } from 'react';

/** Чтение контента страниц. Кеша между запросами нет: правка в админке видна со следующей загрузки. */
export const getFormats = cache(async () => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'formats', sort: '_order', limit: 0, depth: 0 });

  return docs;
});

export const getArticles = cache(async () => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'articles', sort: '-publishedAt', limit: 0, depth: 0 });

  return docs;
});

/** Статья со ссылками на другие статьи: внутренней ссылке в тексте нужен адрес связанной статьи. */
export const getArticle = cache(async (slug: string) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });

  return docs[0] ?? null;
});
