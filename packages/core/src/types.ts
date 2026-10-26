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

/** Размер шрифта версии для слабовидящих, % от обычного. */
export type LowVisionFont = '100' | '150' | '200';

export type LowVisionScheme = 'black-on-white' | 'white-on-black' | 'blue-on-lightblue';

export type LowVisionImages = 'on' | 'off';

export type LowVisionSettings = {
  font: LowVisionFont;
  scheme: LowVisionScheme;
  images: LowVisionImages;
};

/** Событие значка: режим включен с этими настройками; без них режим уже был включен — панели только фокус. */
export type LowVisionEventDetail = {
  settings?: LowVisionSettings;
};

/** Цвета схемы версии для слабовидящих, `#rrggbb`. */
export type LowVisionColors = {
  text: string;
  background: string;
  accent: string;
};

/** Анкета оценки качества: оценки 1–5 без имени и контакта. */
export type Survey = {
  information: number;
  comfort: number;
  /** Доступность для людей с инвалидностью — необязательный вопрос. */
  accessibility?: number;
  courtesy: number;
  satisfaction: number;
  comment?: string;
  demo: string;
};

/** Имена вопросов анкеты — оценки без комментария и демо. */
export type SurveyQuestionName = Exclude<keyof Survey, 'comment' | 'demo'>;

export type SurveyRejection = 'honeypot' | 'ratings';

export type SurveyParseResult = { ok: true; survey: Survey } | { ok: false; reason: SurveyRejection };

export type SurveyContext = {
  demo: string;
};

export type SearchResult = {
  /** Подпись вида результата: «Врач», «Услуга». */
  kind: string;
  title: string;
  href: string;
};

/** Коллекция CMS, по полям которой ищет поиск сайта. */
export type SearchCollection = {
  slug: string;
  fields: string[];
  /** Поле документа, которое станет заголовком результата. */
  title: string;
  href: (doc: Record<string, unknown>) => string;
  kind: string;
  /** Порядок результатов внутри коллекции, как на сайте: `_order` у сортируемых в админке. */
  sort?: string;
};

/** Страница из кода, а не из CMS: ищется по своему тексту. */
export type SearchPage = {
  title: string;
  href: string;
  text: string;
  kind: string;
};

export type SearchSources = {
  collections: SearchCollection[];
  pages: SearchPage[];
};
