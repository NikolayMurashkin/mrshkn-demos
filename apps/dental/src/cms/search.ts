import { NBSP } from '@mrshkn/demo-core/consts';
import { searchSite } from '@mrshkn/demo-core/search';
import type { Payload } from 'payload';
import { BOOKING_RULES, INFO, INFO_HREF, LICENSE, ORGANIZATION, PAID_SERVICES_RULES, SEARCH } from '../consts';

const slugOf = (doc: Record<string, unknown>) => (typeof doc.slug === 'string' ? doc.slug : '');

/** Текст страницы сведений для поиска: заголовки разделов, реквизиты, лицензия и правила — все, что на ней есть. */
const INFO_TEXT = [
  INFO.lead,
  INFO.organization.title,
  INFO.fullNameLabel,
  ORGANIZATION.fullName,
  INFO.ogrnLabel,
  INFO.license.title,
  `Лицензия на${NBSP}медицинскую деятельность ${LICENSE.number} от${NBSP}${LICENSE.date}`,
  LICENSE.issuer,
  ...LICENSE.activities,
  INFO.registryLink,
  INFO.directions.title,
  INFO.bookingRules.title,
  ...BOOKING_RULES,
  INFO.paidRules.title,
  INFO.paidRules.lead,
  ...PAID_SERVICES_RULES,
].join(' ');

/**
 * Поиск по сайту «Клиники»: врачи и услуги — Local API, страница сведений — из констант. Payload — аргументом,
 * а не глобальный конфиг: так поиск проверяется на базе с другой схемой.
 */
export const searchClinic = (payload: Payload, query: string) =>
  searchSite(payload, query, {
    collections: [
      {
        slug: 'doctors',
        fields: ['name', 'position'],
        title: 'name',
        href: (doc) => `/doctors/${slugOf(doc)}`,
        kind: SEARCH.kinds.doctor,
        sort: '_order',
      },
      {
        slug: 'services',
        fields: ['title', 'summary'],
        title: 'title',
        href: (doc) => `/services/${slugOf(doc)}`,
        kind: SEARCH.kinds.service,
        sort: '_order',
      },
    ],
    pages: [{ title: INFO.title, href: INFO_HREF, text: INFO_TEXT, kind: SEARCH.kinds.info }],
  });
