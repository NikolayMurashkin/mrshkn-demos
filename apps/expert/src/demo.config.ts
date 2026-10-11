import { typograph } from '@mrshkn/demo-core/typograph';
import type { DemoConfig } from '@mrshkn/demo-core/types';

/**
 * Психолог вымышлен: имени нет в реестрах, номер дома и кабинет придуманы, улица и город настоящие — как у «Клиники».
 * Телефона и почты у дела нет: единственный путь контакта — запись с оплатой.
 */
export const DEMO: DemoConfig = {
  slug: 'expert',
  title: typograph('Вера Ланская, психолог в Калининграде и онлайн'),
  description: typograph(
    'Психолог в когнитивно-поведенческом подходе: тревога, выгорание, самооценка и отношения. Онлайн и очно в Калининграде, запись с оплатой на сайте.',
  ),
  business: {
    schemaType: 'ProfessionalService',
    name: 'Вера Ланская, психолог',
    description: typograph(
      'Частный психолог в когнитивно-поведенческом подходе: индивидуальные и парные сессии онлайн и в кабинете в Калининграде.',
    ),
    address: {
      streetAddress: 'ул. Генерала Буткова, 4, кабинет 12',
      addressLocality: 'Калининград',
      addressCountry: 'RU',
    },
    openingHours: ['Mo-Fr 10:00-20:00'],
  },
};
