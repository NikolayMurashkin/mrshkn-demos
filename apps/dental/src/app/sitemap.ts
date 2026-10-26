import { demoUrl } from '@mrshkn/demo-core/demo';
import type { MetadataRoute } from 'next';
import { getDoctors, getServices } from '@/cms/queries';
import { DEMO } from '@/demo.config';
import { SITEMAP_PAGES } from '@/consts';

// на сборке базы нет: карта собирается на запрос, со врачами и услугами из CMS
export const dynamic = 'force-dynamic';

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const site = demoUrl(DEMO.slug);
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);
  const paths = [
    ...SITEMAP_PAGES,
    ...doctors.map(({ slug }) => `/doctors/${slug}`),
    ...services.map(({ slug }) => `/services/${slug}`),
  ];

  return paths.map((path) => ({ url: path === '/' ? site : `${site}${path}` }));
};

export default sitemap;
