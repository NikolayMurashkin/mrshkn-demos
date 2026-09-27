import { buildBusinessJsonLd, serializeJsonLd } from '@mrshkn/demo-core/schema';
import type { DemoConfig } from '@mrshkn/demo-core/types';
import { describe, expect, it } from 'vitest';

const DEMO: DemoConfig = {
  slug: 'dental',
  title: 'Демо «Клиника»',
  description: 'Демо стоматологии',
  business: {
    schemaType: 'Dentist',
    name: 'Стоматология «Пример»',
    description: 'Лечение и профилактика',
    telephone: '+7 900 000-00-00',
    address: { streetAddress: 'ул. Примерная, 1', addressLocality: 'Калининград', addressCountry: 'RU' },
    openingHours: ['Mo-Fr 09:00-20:00'],
  },
};

describe('schema.org демо', () => {
  it('описывает дело демо типом из конфига и адресом поддомена', () => {
    expect(buildBusinessJsonLd(DEMO)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Dentist',
      name: 'Стоматология «Пример»',
      description: 'Лечение и профилактика',
      url: 'https://dental.mrshkn.com',
      telephone: '+7 900 000-00-00',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Примерная, 1',
        addressLocality: 'Калининград',
        addressCountry: 'RU',
      },
      openingHours: ['Mo-Fr 09:00-20:00'],
    });
  });

  it('не пишет пустых полей', () => {
    const data = buildBusinessJsonLd({
      ...DEMO,
      business: { schemaType: 'LocalBusiness', name: 'Н', description: 'О' },
    });

    expect(Object.keys(data)).toEqual(['@context', '@type', 'name', 'description', 'url']);
  });

  it('экранирует < в строке, чтобы текст не закрыл тег script', () => {
    const serialized = serializeJsonLd({ name: '</script>' });

    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual({ name: '</script>' });
  });
});
