import config from '@payload-config';
import { getPayload } from 'payload';
import { cache } from 'react';
import type { Master, Review, Service } from '../types';
import { MASTERS_COLLECTION, REVIEWS_COLLECTION, SERVICES_COLLECTION } from './consts';

/** Чтение контента страниц. Кеша между запросами нет: правка в админке видна со следующей загрузки. */
export const getServices = cache(async (): Promise<Service[]> => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: SERVICES_COLLECTION, sort: '_order', limit: 0, depth: 0 });

  return docs.map(({ slug, name, category, duration, price }) => ({ slug, name, category, duration, price }));
});

export const getMasters = cache(async (): Promise<Master[]> => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: MASTERS_COLLECTION, sort: '_order', limit: 0, depth: 0 });

  return docs.map(({ slug, name, nameDative, role, years, about, categories, photo }) => ({
    slug,
    name,
    nameDative: nameDative ?? undefined,
    role,
    years,
    about,
    categories,
    photo: photo ?? undefined,
  }));
});

/** Отзывы в порядке засева, старые выше; мастер — код и имя для подписи и фильтра страницы мастера. */
export const getReviews = cache(async (): Promise<Review[]> => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: REVIEWS_COLLECTION, sort: 'createdAt', limit: 0, depth: 1 });

  return docs.map(({ author, text, subject, master }) => ({
    author,
    text,
    subject: subject ?? undefined,
    master: master && typeof master === 'object' ? { slug: master.slug, name: master.name } : undefined,
  }));
});
