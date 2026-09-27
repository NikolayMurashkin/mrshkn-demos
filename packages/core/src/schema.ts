import { demoUrl } from './demo';
import type { DemoConfig } from './types';

/** Разметка дела, которое показывает демо: тип schema.org, контакты, адрес, часы и точка — только заполненные. */
export const buildBusinessJsonLd = ({ slug, business }: DemoConfig): Record<string, unknown> => {
  const { schemaType, name, description, telephone, email, address, openingHours, geo } = business;

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name,
    description,
    url: demoUrl(slug),
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(address && { address: { '@type': 'PostalAddress', ...address } }),
    ...(openingHours?.length && { openingHours }),
    ...(geo && { geo: { '@type': 'GeoCoordinates', ...geo } }),
  };
};

/** `<` экранируется: строка из CMS с `</script>` иначе закрыла бы тег и вставила бы в страницу свою разметку. */
export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');
