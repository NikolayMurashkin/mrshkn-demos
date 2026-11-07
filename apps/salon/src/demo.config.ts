import type { DemoConfig } from '@mrshkn/demo-core/types';

/**
 * Салон вымышлен: название, переулок и мастера придуманы, телефона нет, точка на карте стоит в центре города
 * примерно и не указывает на настоящий салон. `miniAppUrl` — бот Mini App «Запись» салона: приложение открывает
 * кнопка меню бота, поэтому без `?startapp`; без него кнопки записи ведут к форме заявки на странице записи.
 */
export const DEMO: DemoConfig = {
  slug: 'salon',
  title: 'Салон красоты «Капля лака» в Калининграде',
  description:
    'Маникюр, педикюр, брови, ресницы, стрижки, окрашивание и макияж. Пять мастеров, цены на сайте, онлайн-запись.',
  business: {
    schemaType: 'BeautySalon',
    name: 'Салон красоты «Капля лака»',
    description: 'Салон красоты в Калининграде: маникюр, педикюр, брови, ресницы, волосы и макияж.',
    address: {
      streetAddress: 'Лаковый переулок, 3',
      addressLocality: 'Калининград',
      addressCountry: 'RU',
    },
    openingHours: ['Mo-Su 10:00-21:00'],
    geo: { latitude: 54.7183, longitude: 20.5011 },
  },
  miniAppUrl: 'https://t.me/mrshkn_salon_bot',
};
