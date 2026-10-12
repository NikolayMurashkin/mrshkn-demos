import { typograph } from '@mrshkn/demo-core/typograph';
import type { DemoConfig } from '@mrshkn/demo-core/types';
import { PRODUCT } from './consts';

/** Продукт вымышлен вместе с командами CLI, тарифами и релизами; адреса и телефона у него нет. */
export const DEMO: DemoConfig = {
  slug: 'launch',
  title: typograph(`${PRODUCT.name} — ${PRODUCT.tagline}`),
  description: PRODUCT.description,
  business: {
    schemaType: 'Organization',
    name: PRODUCT.name,
    description: PRODUCT.description,
  },
};
