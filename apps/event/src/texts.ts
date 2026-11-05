import type { DemoLang } from '@mrshkn/demo-core/types';
import type { EventTexts } from './types';

/**
 * Тексты страницы концерта. Русские — с неразрывным пробелом после коротких слов и между числом и единицей: в коде,
 * а не типографом при отрисовке, потому что тексты не из CMS. Подписи кадров (`*Alt`, `gallery.alts`) описывают
 * стоковые кадры из `src/assets/photos`.
 */
export const TEXTS: Record<DemoLang, EventTexts> = {
  ru: {
    meta: {
      title: 'Квартет «Медленный прилив» — джаз в Калининграде',
      description:
        'Квартет «Медленный прилив» в клубе «Причал 9»: программа вечера, адрес, билеты. Концерт вымышленный — это пример сайта от студии MRSHKN.',
    },
    header: {
      home: 'Медленный прилив',
      langLabel: 'Язык',
    },
    hero: {
      kicker: 'Джаз в Калининграде · 12+',
      title: 'Медленный прилив',
      lead: 'Квартет играет известный джаз и свою музыку — «Огни на воде»',
      time: 'начало в 19:00',
      city: 'Калининград, клуб «Причал 9»',
      buy: 'Купить билет',
      priceNote: 'от {price} · билеты на Яндекс Афише',
      plate: 'Мероприятие вымышленное — это пример сайта',
      plateNote: 'Билет на этот концерт не продается: кнопки ведут на все события Калининграда на Яндекс Афише',
      posterAlt: 'Саксофонист играет в полутемном клубе, за ним светится бар',
    },
    about: {
      title: 'О квартете',
      text: [
        'Квартет «Медленный прилив» — фортепиано, контрабас, барабаны и саксофон.',
        'Играют известные джазовые мелодии, которые знают все любители джаза, — каждую по-своему. И свою музыку, которую написали сами. Звучит спокойно: мягкий танцевальный ритм, медленные лирические песни и немного босановы — легкой бразильской музыки. Музыка для вечера без спешки: ее хорошо слушать и в зале, и у бара.',
      ],
      photoAlt: 'Пианист и контрабасист играют на сцене',
    },
    program: {
      title: 'Программа вечера',
      items: [
        '18:00 — открываем двери, работает бар',
        '19:00 — первое отделение: известные джазовые мелодии',
        '20:00 — антракт 20 минут',
        '20:20 — второе отделение: «Огни на воде», музыка, которую квартет написал сам',
        '21:30 — окончание',
      ],
    },
    venue: {
      title: 'Где проходит концерт',
      name: 'Клуб «Причал 9»',
      text: 'Небольшой зал на набережной Преголи. В зале три вида мест: первые ряды у самой сцены, партер — ряды в зале за ними и балкон — места наверху, над залом. Бар работает весь вечер.',
      address: 'Калининград, ул. Октябрьская',
      addressNote:
        'Адрес и точка на карте — для примера: клуба «Причал 9» в Калининграде нет, как нет и самого концерта',
      howTo: 'Как добраться',
      howToText:
        'Парковка рядом маленькая — удобнее приехать на такси или общественном транспорте. Вход — с набережной.',
      photoAlt: 'Небольшая сцена клуба: барабаны, микрофон и лампы у кирпичной стены',
    },
    tickets: {
      title: 'Билеты',
      items: {
        balcony: {
          name: 'Балкон',
          text: 'Сцена видна сверху. Мест по номерам нет — садитесь на любое свободное',
        },
        parterre: {
          name: 'Партер',
          text: 'Ряды в зале, за первыми рядами. Место — по номеру в билете',
        },
        front: {
          name: 'Первые ряды',
          text: 'Ближе всего к сцене, перед партером. Место — по номеру в билете',
        },
      },
      buy: 'Купить билет',
      note: 'Этот концерт вымышленный, на Яндекс Афише его нет. Поэтому кнопка «Купить билет» откроет страницу Калининграда на Яндекс Афише со всеми событиями города. На сайте настоящего концерта кнопка ведет сразу на страницу этого концерта на Афише, там и покупают билет. Сайт Афиши откроется отдельно, а эта страница останется открытой.',
    },
    faq: {
      title: 'Частые вопросы',
      items: [
        {
          q: 'С какого возраста можно прийти?',
          a: 'С 12 лет. Детей до 16 лет пускаем только вместе со взрослым.',
        },
        {
          q: 'Что нужно, чтобы пройти в зал?',
          a: 'Вход открывается в 18:00, концерт начинается в 19:00. На входе покажите билет, который вы получили после покупки на Яндекс Афише: на экране телефона или распечатанный на бумаге.',
        },
        {
          q: 'Можно вернуть билет?',
          a: 'Да, через Яндекс Афишу, там же, где вы его купили. Чем раньше вернете билет, тем больше денег получите. Если вернуть билет за 10 дней до концерта или раньше, вернут всю его цену, кроме сервисного сбора Афиши. Если позже — только часть, а меньше чем за 3 дня могут не вернуть ничего. Сколько именно, написано в вашем заказе на Афише.',
        },
      ],
    },
    gallery: {
      title: 'С прошлых концертов',
      alts: [
        'Силуэты музыкантов и зрителей в синем свете сцены',
        'Руки пианиста на клавишах в полутьме',
        'Контрабас и гитара на пустой сцене',
        'Барабанная установка в луче прожектора',
        'Саксофоны музыкантов крупным планом',
        'Силуэты двух музыкантов на светлом фоне сцены',
      ],
    },
    finale: {
      note: 'от {price} · концерт вымышленный, поэтому кнопка откроет все события Калининграда на Яндекс Афише',
    },
  },
  en: {
    meta: {
      title: 'Slow Tide Quartet — jazz in Kaliningrad',
      description:
        "Slow Tide Quartet at Pier 9 club: the evening's programme, address, tickets. The concert is fictional — a sample website by MRSHKN studio.",
    },
    header: {
      home: 'Slow Tide',
      langLabel: 'Language',
    },
    hero: {
      kicker: 'Jazz in Kaliningrad · 12+',
      title: 'Slow Tide',
      lead: 'The quartet plays well-known jazz and its own music, Lights on the Water',
      time: 'starts at 7 pm',
      city: 'Kaliningrad, Pier 9 club',
      buy: 'Buy tickets',
      priceNote: 'from {price} · tickets on Yandex Afisha',
      plate: 'This event is fictional — this is a sample website',
      plateNote:
        'Tickets for this concert are not on sale: the buttons lead to all Kaliningrad events on Yandex Afisha',
      posterAlt: 'A saxophonist plays in a dimly lit club, the bar glowing behind him',
    },
    about: {
      title: 'The quartet',
      text: [
        'Slow Tide is a quartet: piano, double bass, drums and saxophone.',
        'They play well-known jazz tunes that every jazz lover knows — each in their own way. And music they wrote themselves. It sounds calm: a soft dance beat, slow lyrical songs and a little bossa nova — light Brazilian music. Music for an unhurried evening: good to listen to in the hall or at the bar.',
      ],
      photoAlt: 'A pianist and a double bass player on stage',
    },
    program: {
      title: 'The evening',
      items: [
        '6 pm — doors open, the bar is open',
        '7 pm — first set: well-known jazz tunes',
        '8 pm — 20-minute interval',
        '8:20 pm — second set: Lights on the Water, music the quartet wrote itself',
        '9:30 pm — end',
      ],
    },
    venue: {
      title: 'Where it takes place',
      name: 'Pier 9 club',
      text: 'A small hall on the Pregolya embankment. There are three kinds of seats: front rows right by the stage, the stalls — rows in the hall behind them, and the balcony — seats upstairs, above the hall. The bar is open all evening.',
      address: 'Oktyabrskaya St, Kaliningrad',
      addressNote:
        'The address and the map pin are only an example: there is no Pier 9 club in Kaliningrad, and no concert either',
      howTo: 'Getting there',
      howToText:
        'Parking nearby is small, so a taxi or public transport is easier. The entrance is on the embankment side.',
      photoAlt: 'A small club stage: drums, a microphone and lamps by a brick wall',
    },
    tickets: {
      title: 'Tickets',
      items: {
        balcony: {
          name: 'Balcony',
          text: 'The stage is seen from above. Seats are not numbered — take any free one',
        },
        parterre: {
          name: 'Stalls',
          text: 'Rows in the hall, behind the front rows. Your seat is the number on your ticket',
        },
        front: {
          name: 'Front rows',
          text: 'Closest to the stage, in front of the stalls. Your seat is the number on your ticket',
        },
      },
      buy: 'Buy tickets',
      note: "This concert is fictional and not on Yandex Afisha. So the Buy tickets button opens the Kaliningrad page on Yandex Afisha with all the city's events. On a real concert's website the button leads straight to that concert's page on Afisha, where you buy the ticket. The Afisha website opens separately, and this page stays open.",
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Is there an age limit?',
          a: '12 and over. Under-16s are let in only with an adult.',
        },
        {
          q: 'What do I need to get in?',
          a: 'Doors open at 6 pm, the concert starts at 7 pm. At the entrance, show the ticket you got after buying on Yandex Afisha — on your phone screen or printed on paper.',
        },
        {
          q: 'Can I return a ticket?',
          a: "Yes, through Yandex Afisha, where you bought it. The earlier you return the ticket, the more you get back. If you return it 10 days before the concert or earlier, you get the full price back, except Afisha's service fee. Later, only part of it, and less than 3 days before the concert you may get nothing back. The exact amount is in your Afisha order.",
        },
      ],
    },
    gallery: {
      title: 'From past concerts',
      alts: [
        'Silhouettes of musicians and the audience in blue stage light',
        "A pianist's hands on the keys in dim light",
        'A double bass and a guitar on an empty stage',
        'A drum kit in a spotlight beam',
        "Close-up of saxophones in musicians' hands",
        'Silhouettes of two musicians against a bright stage backdrop',
      ],
    },
    finale: {
      note: 'from {price} · the concert is fictional, so the button opens all Kaliningrad events on Yandex Afisha',
    },
  },
};
