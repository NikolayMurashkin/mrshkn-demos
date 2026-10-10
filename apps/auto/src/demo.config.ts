import type { DemoConfig, DemoLang } from '@mrshkn/demo-core/types';

/**
 * Автосервис вымышлен: названия нет в реестрах, улицы придуманы, телефоны — нули в формате страны. У каждого
 * языка свое дело: «Фаза» в Калининграде для русской версии и Phase Garage в Колумбусе (Огайо) для английской —
 * со своим адресом, часами и точкой на карте.
 */
export const DEMOS: Record<DemoLang, DemoConfig> = {
  ru: {
    slug: 'auto',
    title: 'Автосервис «Фаза» в Калининграде',
    description: 'Выберите, что беспокоит в машине: покажем вероятные причины, цену работы и срок. Запись онлайн.',
    business: {
      schemaType: 'AutoRepair',
      name: 'Автосервис «Фаза»',
      description:
        'Автосервис в Калининграде: двигатель и цепь ГРМ, подвеска, тормоза, рулевое, электрика, охлаждение, выхлоп, сцепление и коробка передач.',
      address: {
        streetAddress: 'ул. Карданная, 12',
        addressLocality: 'Калининград',
        addressCountry: 'RU',
      },
      telephone: '+7 000 000-00-00',
      openingHours: ['Mo-Sa 09:00-20:00'],
      geo: { latitude: 54.6896, longitude: 20.5321 },
    },
  },
  en: {
    slug: 'auto',
    title: 'Phase Garage in Columbus, Ohio',
    description: 'Tell us what’s wrong with your car: see likely causes, labor prices and repair times. Book online.',
    business: {
      schemaType: 'AutoRepair',
      name: 'Phase Garage',
      description:
        'Auto repair in Columbus, Ohio: engine and timing chain, suspension, brakes, steering, electrics, cooling, exhaust, clutch and gearbox.',
      address: {
        streetAddress: '1250 Camshaft Ave',
        addressLocality: 'Columbus, OH',
        postalCode: '43215',
        addressCountry: 'US',
      },
      telephone: '+1 000-000-0000',
      openingHours: ['Mo-Sa 09:00-20:00'],
      geo: { latitude: 39.9625, longitude: -83.0032 },
    },
  },
};

/** Дело по умолчанию — русская версия: ее берут обработчик заявки и заголовок админки. */
export const DEMO: DemoConfig = DEMOS.ru;
