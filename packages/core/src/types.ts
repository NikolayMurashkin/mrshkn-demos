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
  /** Deep-link Mini App «Запись» (`https://t.me/<bot>?startapp=<slug>`); без него запись ведет к форме заявки. */
  miniAppUrl?: string;
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

/** Язык текстов демо и ядра. */
export type DemoLang = 'ru' | 'en';
