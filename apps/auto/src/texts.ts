import type { DemoLang } from '@mrshkn/demo-core/types';

export type AutoTexts = {
  header: {
    brand: string;
    brandNote: string;
    langLabel: string;
  };
  hero: {
    heading: string;
    intro: string;
    symptomsLabel: string;
    nodesLabel: string;
    posterAlt: string;
    emptyCard: string;
    symptomPrefix: string;
    close: string;
    book: string;
  };
  card: {
    tableCaption: string;
    colCause: string;
    colPrice: string;
    colTerm: string;
    from: string;
    priceNote: string;
  };
  nodes: {
    title: string;
    lead: string;
  };
  booking: {
    title: string;
    lead: string;
  };
  reviews: {
    title: string;
  };
  contacts: {
    title: string;
    address: string;
    phone: string;
    hours: string;
    hoursText: string;
  };
  footer: {
    fictional: string;
  };
  privacy: {
    mark: string;
  };
};

/**
 * Тексты страницы демо. Русские — с неразрывными пробелами после коротких слов и перед тире; английские — для
 * рынка США, ждут вычитки в `TRANSLATION-TODO.md`. Тексты узлов, симптомов и отзывов — в CMS.
 */
export const TEXTS: Record<DemoLang, AutoTexts> = {
  ru: {
    header: {
      brand: 'Фаза',
      brandNote: 'автосервис',
      langLabel: 'Язык сайта',
    },
    hero: {
      heading: 'Где болит?',
      intro: 'Выберите, что беспокоит, или нажмите на узел машины. Покажем вероятные причины, цену работы и срок.',
      symptomsLabel: 'Что беспокоит',
      nodesLabel: 'Узлы машины',
      posterAlt:
        'Кроссовер в боксе автосервиса: перед машины просвечен рентгеном до средней стойки, видны двигатель, подвеска и колеса; корма в вишневой краске.',
      emptyCard: 'Нажмите на узел машины или выберите симптом. Здесь появятся причины, цена работы и срок.',
      symptomPrefix: 'Симптом',
      close: 'Показать всю машину',
      book: 'Записаться',
    },
    card: {
      tableCaption: 'Вероятные причины, цена работы и срок',
      colCause: 'Вероятная причина',
      colPrice: 'Работа',
      colTerm: 'Срок',
      from: 'от',
      priceNote: 'Цена работы без запчастей. Точную сумму назовем после диагностики.',
    },
    nodes: {
      title: 'Узлы и цены',
      lead: 'Все восемь узлов: вероятные причины, цена работы и срок. Цена работы без запчастей, точную сумму назовем после диагностики.',
    },
    booking: {
      title: 'Запись',
      lead: 'Оставьте имя и способ связи — перезвоним, подберем время и скажем, что взять с собой.',
    },
    reviews: {
      title: 'Отзывы',
    },
    contacts: {
      title: 'Контакты',
      address: 'Адрес',
      phone: 'Телефон',
      hours: 'Часы работы',
      hoursText: 'Пн–Сб, 9:00–20:00',
    },
    footer: {
      fictional: 'Автосервис и цены вымышлены.',
    },
    privacy: {
      mark: 'Документ',
    },
  },
  en: {
    header: {
      brand: 'Phase',
      brandNote: 'garage',
      langLabel: 'Site language',
    },
    hero: {
      heading: 'Where does it hurt?',
      intro:
        'Pick what’s bothering you or tap a part of the car. You’ll see likely causes, labor prices and repair times.',
      symptomsLabel: 'Symptoms',
      nodesLabel: 'Car parts',
      posterAlt:
        'A crossover in a service bay: the front of the car is X-rayed up to the middle pillar, showing the engine, suspension and wheels; the rear is in cherry-red paint.',
      emptyCard:
        'Tap a part of the car or pick a symptom. Likely causes, labor prices and repair times will show up here.',
      symptomPrefix: 'Symptom',
      close: 'Show the whole car',
      book: 'Book a visit',
    },
    card: {
      tableCaption: 'Likely causes, labor price and repair time',
      colCause: 'Likely cause',
      colPrice: 'Labor',
      colTerm: 'Time',
      from: 'from',
      priceNote: 'Labor only, parts extra. We confirm the exact price after an inspection.',
    },
    nodes: {
      title: 'Parts and prices',
      lead: 'All eight parts with likely causes, labor prices and repair times. Labor only, parts extra: we confirm the exact price after an inspection.',
    },
    booking: {
      title: 'Book a visit',
      lead: 'Leave your name and how to reach you. We’ll call back, find a time and tell you what to bring.',
    },
    reviews: {
      title: 'Reviews',
    },
    contacts: {
      title: 'Contacts',
      address: 'Address',
      phone: 'Phone',
      hours: 'Opening hours',
      hoursText: 'Mon–Sat, 9 AM–8 PM',
    },
    footer: {
      fictional: 'The shop and prices are fictional.',
    },
    privacy: {
      mark: 'Document',
    },
  },
};
