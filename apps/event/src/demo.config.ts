import type { DemoConfig, DemoLang } from '@mrshkn/demo-core/types';
import { TEXTS } from './texts';

/**
 * Концерт и клуб вымышлены: в Калининграде нет ни квартета, ни клуба с такими названиями. В разметке schema.org —
 * только клуб как место (`MusicVenue`): события с датой и билетами там нет, чтобы несуществующий концерт не попал
 * в выдачу поиска. Улица настоящая, номера дома нет: клуба на ней нет, а дом с номером был бы чужим зданием. Точка
 * карты — на набережной Ветеранов вдоль ул. Октябрьской, у воды, не на здании (проверено на Яндекс Картах 03.11.2026).
 */
const venue = (lang: DemoLang, streetAddress: string): DemoConfig => ({
  slug: 'event',
  title: TEXTS[lang].meta.title,
  description: TEXTS[lang].meta.description,
  business: {
    schemaType: 'MusicVenue',
    name: TEXTS[lang].venue.name,
    description: TEXTS[lang].venue.text,
    address: {
      streetAddress,
      addressLocality: lang === 'ru' ? 'Калининград' : 'Kaliningrad',
      addressCountry: 'RU',
    },
    geo: { latitude: 54.705252, longitude: 20.514219 },
  },
});

export const DEMOS: Record<DemoLang, DemoConfig> = {
  ru: venue('ru', 'ул. Октябрьская'),
  en: venue('en', 'Oktyabrskaya St'),
};

/** Дело по умолчанию — русская версия: его берет заголовок админки. */
export const DEMO: DemoConfig = DEMOS.ru;
