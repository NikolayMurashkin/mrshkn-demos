export type LangParams = Promise<{ lang: string }>;

export type LangPageProps = {
  params: LangParams;
};

export type TicketId = 'balcony' | 'parterre' | 'front';

export type Ticket = {
  id: TicketId;
  /** Цена в рублях, без копеек. */
  price: number;
};

/** Тексты страницы концерта: у русской и английской версии одни и те же ключи. */
export type EventTexts = {
  meta: {
    title: string;
    description: string;
  };
  header: {
    home: string;
    langLabel: string;
  };
  hero: {
    kicker: string;
    title: string;
    lead: string;
    time: string;
    city: string;
    buy: string;
    /** `{price}` — цена самой дешевой категории по формату языка. */
    priceNote: string;
    plate: string;
    plateNote: string;
    posterAlt: string;
  };
  about: {
    title: string;
    text: string[];
    photoAlt: string;
  };
  program: {
    title: string;
    /** «Время — что происходит»: время до первого « — ». */
    items: string[];
  };
  venue: {
    title: string;
    name: string;
    text: string;
    address: string;
    /** Под адресом: адрес настоящий, клуба по нему нет. */
    addressNote: string;
    howTo: string;
    howToText: string;
    photoAlt: string;
  };
  tickets: {
    title: string;
    items: Record<TicketId, { name: string; text: string }>;
    buy: string;
    note: string;
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  gallery: {
    title: string;
    /** Подписи кадров по порядку `GALLERY`. */
    alts: string[];
  };
  finale: {
    /** Строка под кнопкой финальной плиты; `{price}` — как у `hero.priceNote`. */
    note: string;
  };
};
