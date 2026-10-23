import type { SanitizedConfig } from 'payload';

export type MapPoint = {
  latitude: number;
  longitude: number;
};

export type DemoAddress = {
  streetAddress: string;
  addressLocality: string;
  postalCode?: string;
  addressCountry: string;
};

/** Вымышленное дело, которое показывает демо: из него собираются метаданные и разметка schema.org. */
export type DemoBusiness = {
  /** Тип schema.org: `LocalBusiness`, `Dentist`, `CafeOrCoffeeShop`, `ProfessionalService`… */
  schemaType: string;
  name: string;
  description: string;
  telephone?: string;
  email?: string;
  address?: DemoAddress;
  /** Часы работы в формате schema.org: `Mo-Fr 09:00-20:00`. */
  openingHours?: string[];
  /** Точка на карте: метка виджета карты и координаты в schema.org. */
  geo?: MapPoint;
};

export type DemoConfig = {
  /** Имя поддомена: демо живет на `<slug>.mrshkn.com`. */
  slug: string;
  title: string;
  description: string;
  business: DemoBusiness;
  /** Бот экземпляра Mini App «Запись» этого демо (`https://t.me/<bot>`, у каждого демо свой); без него запись ведет к форме заявки. */
  miniAppUrl?: string;
  /** Бот того же Mini App «Запись» в MAX (`https://max.ru/<ник бота>?startapp`); без него вторая ссылка записи не рисуется. */
  maxAppUrl?: string;
  /** Номер организации на Яндекс Картах; без него раздела отзывов нет. */
  yandexOrgId?: string;
};

/** Отзыв вымышленного пациента вымышленного дела: только текст и подпись, без фото и оценок. */
export type DemoReview = {
  /** Имя и первая буква фамилии: «Ирина С.». */
  author: string;
  text: string;
  /** О чем отзыв: услуга или врач. */
  subject?: string | null;
};

export type Lead = {
  demo: string;
  name: string;
  contact: string;
  comment: string;
  page: string;
};

export type LeadRejection = 'honeypot' | 'consent' | 'fields';

export type LeadParseResult = { ok: true; lead: Lead } | { ok: false; reason: LeadRejection };

export type LeadContext = {
  demo: string;
  page: string;
};

export type RateLimiterOptions = {
  limit: number;
  windowMs: number;
};

export type LeadRouteOptions = {
  config: Promise<SanitizedConfig> | SanitizedConfig;
  demo: DemoConfig;
};

export type LeadFormStatus = 'idle' | 'sending' | 'sent' | 'invalid' | 'failed';

/** Форма сайта, которая собирает данные посетителя: заявка ядра или список ожидания. */
export type PolicyForm = 'lead' | 'waitlist';

/** Язык текстов демо и ядра. */
export type DemoLang = 'ru' | 'en';
