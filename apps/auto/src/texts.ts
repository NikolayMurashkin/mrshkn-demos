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
    sceneLabel: string;
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
  scene: {
    hint: string;
    loading: string;
  };
  explain: {
    suspensionTitle: string;
    suspensionLead: string;
    wear: string;
    settle: string;
    airborne: string;
    newShock: string;
    seconds: string;
    plotNow: string;
    plotNew: string;
    plotAir: string;
    suspensionNote: string;
    chainTitle: string;
    chainLead: string;
    stretch: string;
    mm: string;
    shift: string;
    crankDegrees: string;
    chain_ok: string;
    chain_replace: string;
    chain_error: string;
    chain_skip: string;
    chainNote: string;
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
      sceneLabel: 'Машина в рентгене, 8 узлов. Узел можно выбрать кнопками над сценой.',
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
    scene: {
      hint: 'Потяните машину, чтобы повернуть',
      loading: 'Загружаем 3D-модель…',
    },
    explain: {
      suspensionTitle: 'Почему машину раскачивает',
      suspensionLead:
        'Амортизатор гасит качание кузова на пружине. Сдвиньте износ: машина проедет лежачего полицейского, а график покажет, сколько кузов качается после него.',
      wear: 'Износ амортизатора',
      settle: 'Качание стихает за',
      airborne: 'Колесо без контакта с дорогой',
      newShock: 'с новым —',
      seconds: 'с',
      plotNow: 'кузов сейчас',
      plotNew: 'с новым амортизатором',
      plotAir: 'колесо в воздухе',
      suspensionNote:
        'Расчет — модель «четверть автомобиля»: кузов на пружине и амортизаторе, колесо на шине. Кочка — резиновый лежачий полицейский по ГОСТ, {length} × {height} м, скорость {speed} км/ч. Износ — доля усилия, которую амортизатор потерял. Колесо в воздухе не тормозит и не рулит.',
      chainTitle: 'Как растянутая цепь сбивает фазы',
      chainLead:
        'Шарниры цепи изнашиваются, и она вытягивается. Распредвал начинает отставать от коленвала, клапаны открываются позже. Сдвиньте растяжение: звездочка распредвала отстанет от своей тени.',
      stretch: 'Растяжение цепи',
      mm: 'мм',
      shift: 'Распредвал отстает на',
      crankDegrees: 'по коленвалу',
      chain_ok: 'Цепь в пределах износа, менять рано.',
      chain_replace:
        'Цепь вытянулась на {limit} и больше — это предел износа цепей ГРМ. Пора менять, хотя фазы еще в норме производителя.',
      chain_error:
        'Распредвал вышел за норму производителя: {norm} на холостом ходу. Блок управления может записать ошибку рассогласования валов и зажечь Check Engine.',
      chain_skip:
        'Зона риска перескока: от {skip} приводные цепи считают изношенными до предела. Натяжитель выбирает все больше провиса, а если ослабнет — цепь может перескочить через зуб звездочки.',
      chainNote:
        'Расчет по геометрии привода этой модели: натяжитель выбирает провис на свободной ветви, а удлинение рабочей ветви между звездочками поворачивает распредвал назад. Пороги — из документов производителей и инженерной литературы.',
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
      sceneLabel: 'X-ray view of the car with 8 parts. Use the buttons over the view to pick a part.',
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
    scene: {
      hint: 'Drag the car to turn it',
      loading: 'Loading the 3D model…',
    },
    explain: {
      suspensionTitle: 'Why the car keeps bouncing',
      suspensionLead:
        'A shock absorber damps the body bouncing on its spring. Move the wear slider: the car rolls over a speed bump, and the plot shows how long the body keeps moving.',
      wear: 'Shock wear',
      settle: 'Bouncing dies out in',
      airborne: 'Tire off the road',
      newShock: 'new shock:',
      seconds: 's',
      plotNow: 'body now',
      plotNew: 'with a new shock',
      plotAir: 'tire in the air',
      suspensionNote:
        'Computed with a quarter-car model: the body on a spring and a shock, the wheel on its tire. The bump is a standard rubber speed bump, {length} × {height} m, taken at {speed} km/h. Wear is the share of damping force the shock has lost. A tire in the air can’t brake or steer.',
      chainTitle: 'How a stretched chain throws off the timing',
      chainLead:
        'Chain pins wear and the chain gets longer. The camshaft starts lagging behind the crankshaft and the valves open late. Move the slider: the cam sprocket falls behind its ghost.',
      stretch: 'Chain stretch',
      mm: 'mm',
      shift: 'Camshaft lag',
      crankDegrees: 'at the crank',
      chain_ok: 'The chain is within its wear limit. No need to replace it yet.',
      chain_replace:
        'The chain has stretched {limit} or more, the wear limit for timing chains. Time to replace it, even though the timing is still within spec.',
      chain_error:
        'The camshaft is out of the manufacturer’s spec of {norm} at idle. The engine computer may store a cam/crank correlation code and turn on the check engine light.',
      chain_skip:
        'Jump risk: from {skip}, drive chains count as fully worn. The tensioner takes up more and more slack, and if it weakens, the chain can skip a sprocket tooth.',
      chainNote:
        'Computed from this model’s drive geometry: the tensioner takes up the slack side, and the stretch of the tight side between the sprockets turns the camshaft back. The limits come from manufacturers’ documents and engineering literature.',
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
