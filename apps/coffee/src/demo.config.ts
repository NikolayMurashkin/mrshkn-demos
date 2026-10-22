import type { DemoConfig } from '@mrshkn/demo-core/types';

/**
 * Кофейня вымышлена: улица настоящая, номер дома и телефон — нет (телефон нулями, чтобы не совпасть с чужим),
 * точка на карте стоит на улице примерно и не указывает на настоящее заведение.
 */
export const DEMO: DemoConfig = {
  slug: 'coffee',
  title: 'Кофейня «Гуща» в Калининграде',
  description:
    'Кофе, чай, выпечка и завтраки на углу Галицкого. Меню с фильтром по признакам, часы работы и карта лояльности.',
  business: {
    schemaType: 'CafeOrCoffeeShop',
    name: 'Кофейня «Гуща»',
    description: 'Кофейня с завтраками в Калининграде: кофе, чай, выпечка каждое утро.',
    address: {
      streetAddress: 'ул. Генерала Галицкого, 12',
      addressLocality: 'Калининград',
      addressCountry: 'RU',
    },
    telephone: '+7 952 000-00-21',
    openingHours: ['Mo-Fr 08:00-21:00', 'Sa-Su 09:00-21:00'],
    geo: { latitude: 54.7339, longitude: 20.4866 },
  },
};
