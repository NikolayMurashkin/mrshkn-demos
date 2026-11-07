import { demoUrl, robotsMetadata } from '@mrshkn/demo-core/demo';
import type { Metadata } from 'next';
import { DEMO } from '../demo.config';

export const siteMetadata: Metadata = {
  metadataBase: new URL(demoUrl(DEMO.slug)),
  title: { default: DEMO.title, template: `%s — ${DEMO.business.name}` },
  description: DEMO.description,
  robots: robotsMetadata(),
};
