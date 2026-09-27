import config from '@payload-config';
import { getPayload } from 'payload';
import { cache } from 'react';

/** Чтение контента страниц. Кеша между запросами нет: правка в админке видна со следующей загрузки. */
export const getServices = cache(async () => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'services', sort: '_order', limit: 0, depth: 0 });

  return docs;
});

export const getService = cache(async (slug: string) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1 });

  return docs[0] ?? null;
});

export const getDoctors = cache(async () => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'doctors', sort: '_order', limit: 0, depth: 0 });

  return docs;
});

/** Врач вместе с услугами, которые он ведет. */
export const getDoctor = cache(async (slug: string) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'doctors',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });

  return docs[0] ?? null;
});

export const getDoctorsOfService = cache(async (serviceId: number) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'doctors',
    where: { services: { in: [serviceId] } },
    sort: '_order',
    limit: 0,
    depth: 0,
  });

  return docs;
});

export const getReviews = cache(async () => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'reviews', sort: 'createdAt', limit: 0 });

  return docs;
});
