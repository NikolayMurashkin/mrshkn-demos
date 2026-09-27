import type { Metadata } from 'next';
import { DEMO_DOMAIN, DEMO_ENV_PRODUCTION } from './consts';

export const demoUrl = (slug: string) => `https://${slug}.${DEMO_DOMAIN}`;

export const isIndexable = (value: string | undefined = process.env.DEMO_ENV) => value === DEMO_ENV_PRODUCTION;

export const robotsMetadata = (indexable: boolean = isIndexable()): Metadata['robots'] =>
  indexable ? undefined : { index: false, follow: false };
