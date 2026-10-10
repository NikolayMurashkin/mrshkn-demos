import type { SeedNode, SeedReview, SeedSymptom } from '../types';

/**
 * Вымышленный контент автосервиса: узлы, причины с ценой работы «от» и сроком, симптомы и отзывы. Засевается
 * в пустую базу при старте; дальше его правят в админке. Цены — работа без запчастей: на русском в рублях,
 * на английском в долларах рынка США. Тексты без неразрывных пробелов — их ставит типограф при отрисовке.
 */
export const NODES: SeedNode[] = [
  {
    key: 'engine',
    content: {
      ru: {
        name: 'Двигатель и цепь ГРМ',
        causes: [
          { text: 'Растянулась цепь ГРМ или износился натяжитель', price: 18000, term: '1–2 дня' },
          { text: 'Заедает фазорегулятор распредвала', price: 6500, term: '4–6 ч' },
          { text: 'Изношены свечи или неисправна катушка зажигания', price: 1500, term: '1 ч' },
          { text: 'Подсос воздуха во впуске', price: 2000, term: '1–2 ч' },
        ],
      },
      en: {
        name: 'Engine and timing chain',
        causes: [
          { text: 'Stretched timing chain or worn tensioner', price: 950, term: '1–2 days' },
          { text: 'Sticking cam phaser', price: 480, term: '4–6 h' },
          { text: 'Worn spark plugs or a failing ignition coil', price: 110, term: '1 h' },
          { text: 'Intake vacuum leak', price: 150, term: '1–2 h' },
        ],
      },
    },
  },
  {
    key: 'suspension',
    content: {
      ru: {
        name: 'Подвеска и амортизаторы',
        causes: [
          { text: 'Потекли или выработались амортизаторы', price: 3500, term: '2–3 ч' },
          { text: 'Изношены стойки стабилизатора', price: 1200, term: '1 ч' },
          { text: 'Разбиты сайлентблоки рычагов', price: 3000, term: '2–3 ч' },
          { text: 'Изношены опорные подшипники стоек', price: 2500, term: '2 ч' },
        ],
      },
      en: {
        name: 'Suspension and shocks',
        causes: [
          { text: 'Leaking or worn-out shocks', price: 240, term: '2–3 h' },
          { text: 'Worn sway bar links', price: 120, term: '1 h' },
          { text: 'Worn control arm bushings', price: 260, term: '2–3 h' },
          { text: 'Worn strut mount bearings', price: 200, term: '2 h' },
        ],
      },
    },
  },
  {
    key: 'brakes',
    content: {
      ru: {
        name: 'Тормоза',
        causes: [
          { text: 'Износились тормозные колодки', price: 1500, term: '1 ч' },
          { text: 'Повело или стерлись тормозные диски', price: 2800, term: '1–2 ч' },
          { text: 'Закисли направляющие суппорта', price: 1200, term: '1 ч' },
          { text: 'Тормозная жидкость отслужила срок', price: 1000, term: '40 мин' },
        ],
      },
      en: {
        name: 'Brakes',
        causes: [
          { text: 'Worn brake pads', price: 120, term: '1 h' },
          { text: 'Warped or worn brake rotors', price: 180, term: '1–2 h' },
          { text: 'Seized caliper slide pins', price: 110, term: '1 h' },
          { text: 'Brake fluid past its service life', price: 100, term: '40 min' },
        ],
      },
    },
  },
  {
    key: 'steering',
    content: {
      ru: {
        name: 'Рулевое управление',
        causes: [
          { text: 'Изношены рулевые наконечники', price: 1400, term: '1 ч' },
          { text: 'Изношены рулевые тяги', price: 2000, term: '1–2 ч' },
          { text: 'Стучит рулевая рейка', price: 7000, term: '3–5 ч' },
          { text: 'Сбиты углы установки колес', price: 1800, term: '1 ч' },
        ],
      },
      en: {
        name: 'Steering',
        causes: [
          { text: 'Worn tie rod ends', price: 130, term: '1 h' },
          { text: 'Worn inner tie rods', price: 170, term: '1–2 h' },
          { text: 'Knocking steering rack', price: 520, term: '3–5 h' },
          { text: 'Wheel alignment is off', price: 120, term: '1 h' },
        ],
      },
    },
  },
  {
    key: 'electrics',
    content: {
      ru: {
        name: 'АКБ и электрика',
        causes: [
          { text: 'Аккумулятор выработал ресурс', price: 500, term: '20 мин' },
          { text: 'Генератор не заряжает', price: 3000, term: '2–3 ч' },
          { text: 'Окислились клеммы или провод массы', price: 800, term: '30 мин' },
          { text: 'Утечка тока на стоянке', price: 2500, term: '2–4 ч' },
        ],
      },
      en: {
        name: 'Battery and electrics',
        causes: [
          { text: 'Battery at the end of its life', price: 40, term: '20 min' },
          { text: 'Alternator not charging', price: 260, term: '2–3 h' },
          { text: 'Corroded terminals or ground strap', price: 80, term: '30 min' },
          { text: 'Parasitic battery drain', price: 180, term: '2–4 h' },
        ],
      },
    },
  },
  {
    key: 'cooling',
    content: {
      ru: {
        name: 'Охлаждение',
        causes: [
          { text: 'Заклинил термостат', price: 2500, term: '1–2 ч' },
          { text: 'Течь патрубков или радиатора', price: 1500, term: '1–2 ч' },
          { text: 'Изношена помпа', price: 5500, term: '3–4 ч' },
          { text: 'Не включается вентилятор радиатора', price: 1800, term: '1 ч' },
          { text: 'Воздушная пробка или забит радиатор печки', price: 1500, term: '1 ч' },
        ],
      },
      en: {
        name: 'Cooling',
        causes: [
          { text: 'Stuck thermostat', price: 180, term: '1–2 h' },
          { text: 'Leaking hoses or radiator', price: 140, term: '1–2 h' },
          { text: 'Failing water pump', price: 420, term: '3–4 h' },
          { text: 'Radiator fan not switching on', price: 150, term: '1 h' },
          { text: 'Air lock or a clogged heater core', price: 140, term: '1 h' },
        ],
      },
    },
  },
  {
    key: 'exhaust',
    content: {
      ru: {
        name: 'Выхлоп',
        causes: [
          { text: 'Прогорел глушитель или резонатор', price: 2500, term: '1–2 ч' },
          { text: 'Порвалась гофра приемной трубы', price: 2000, term: '1 ч' },
          { text: 'Пробита прокладка выпускного коллектора', price: 3500, term: '2–3 ч' },
          { text: 'Разрушен катализатор', price: 4000, term: '1–2 ч' },
        ],
      },
      en: {
        name: 'Exhaust',
        causes: [
          { text: 'Burnt-out muffler or resonator', price: 160, term: '1–2 h' },
          { text: 'Torn exhaust flex pipe', price: 140, term: '1 h' },
          { text: 'Blown exhaust manifold gasket', price: 260, term: '2–3 h' },
          { text: 'Damaged catalytic converter', price: 220, term: '1–2 h' },
        ],
      },
    },
  },
  {
    key: 'transmission',
    content: {
      ru: {
        name: 'Сцепление и КПП',
        causes: [
          { text: 'Износился диск сцепления или выжимной подшипник', price: 12000, term: '1 день' },
          { text: 'Сцепление не выключается до конца', price: 2500, term: '1–2 ч' },
          { text: 'Изношены синхронизаторы коробки', price: 15000, term: '2 дня' },
          { text: 'Старое масло в коробке передач', price: 2000, term: '1 ч' },
        ],
      },
      en: {
        name: 'Clutch and gearbox',
        causes: [
          { text: 'Worn clutch disc or release bearing', price: 850, term: '1 day' },
          { text: 'Clutch doesn’t fully disengage', price: 190, term: '1–2 h' },
          { text: 'Worn gearbox synchronizers', price: 1100, term: '2 days' },
          { text: 'Old gearbox fluid', price: 130, term: '1 h' },
        ],
      },
    },
  },
];

/** Порядок — как в списке «Где болит?»: сначала частые жалобы. */
export const SYMPTOMS: SeedSymptom[] = [
  {
    key: 'brake-squeal',
    node: 'brakes',
    place: 'rear',
    text: { ru: 'Скрип или скрежет при торможении', en: 'Squealing or grinding when braking' },
  },
  {
    key: 'knock-bumps',
    node: 'suspension',
    text: { ru: 'Стук в подвеске на кочках', en: 'Knocking over bumps' },
  },
  {
    key: 'chain-rattle',
    node: 'engine',
    place: 'timing',
    text: { ru: 'Шелест или стук цепи после холодного пуска', en: 'Chain rattle after a cold start' },
  },
  {
    key: 'overheating',
    node: 'cooling',
    text: { ru: 'Стрелка температуры уходит вверх', en: 'Temperature gauge creeping up' },
  },
  {
    key: 'slow-crank',
    node: 'electrics',
    text: { ru: 'Двигатель тяжело заводится утром', en: 'Engine cranks slowly in the morning' },
  },
  {
    key: 'steering-play',
    node: 'steering',
    text: { ru: 'Люфт руля, машина рыскает по дороге', en: 'Loose steering, the car wanders' },
  },
  {
    key: 'loud-exhaust',
    node: 'exhaust',
    text: { ru: 'Выхлоп стал громким, машина рычит', en: 'Exhaust got loud and rumbly' },
  },
  {
    key: 'gear-grind',
    node: 'transmission',
    text: { ru: 'Передачи включаются с хрустом', en: 'Gears grind when shifting' },
  },
  {
    key: 'bouncing',
    node: 'suspension',
    place: 'rear',
    text: { ru: 'Машину раскачивает после неровностей', en: 'The car keeps bouncing after bumps' },
  },
  {
    key: 'misfire',
    node: 'engine',
    text: { ru: 'Мотор троит, горит лампа Check Engine', en: 'Rough running with the check engine light on' },
  },
  {
    key: 'battery-light',
    node: 'electrics',
    text: { ru: 'На приборке горит лампа аккумулятора', en: 'Battery warning light on the dash' },
  },
  {
    key: 'brake-shudder',
    node: 'brakes',
    text: { ru: 'Руль бьет при торможении', en: 'Steering wheel shakes when braking' },
  },
  {
    key: 'cold-heater',
    node: 'cooling',
    text: { ru: 'Печка дует холодным воздухом', en: 'Heater blows cold air' },
  },
  {
    key: 'steering-knock',
    node: 'steering',
    text: { ru: 'Стук в руле на неровностях', en: 'Knock through the steering wheel on rough roads' },
  },
  {
    key: 'clutch-slip',
    node: 'transmission',
    text: { ru: 'Обороты растут, а машина не разгоняется', en: 'Revs climb but the car doesn’t speed up' },
  },
];

/** Вымышленные отзывы о вымышленном сервисе: имя и первая буква фамилии, без фото и оценок. */
export const REVIEWS: SeedReview[] = [
  {
    ru: {
      author: 'Андрей К.',
      subject: 'Цепь ГРМ',
      text: 'Утром после запуска мотор шелестел секунд десять. Мастер показал, где растянулась цепь, и назвал цену до начала работы. Машину забрал на следующий день, итог совпал с тем, что назвали.',
    },
    en: {
      author: 'Daniel K.',
      subject: 'Timing chain',
      text: 'My engine rattled for a few seconds every cold morning. The tech showed me where the chain had stretched and quoted a price before starting. I picked the car up the next day, and the bill matched the quote.',
    },
  },
  {
    ru: {
      author: 'Ольга М.',
      subject: 'Тормоза',
      text: 'Скрипели задние тормоза. Мастер снял колесо при мне, показал колодки и закисшие направляющие. Поменяли за час, пока я пила кофе.',
    },
    en: {
      author: 'Emily R.',
      subject: 'Brakes',
      text: 'The rear brakes kept squealing. The tech pulled the wheel while I watched and showed me the worn pads and seized slide pins. Done in an hour while I had a coffee.',
    },
  },
  {
    ru: {
      author: 'Сергей Т.',
      subject: 'Подвеска',
      text: 'Машину раскачивало после каждой кочки. Объяснили, что потекли амортизаторы, и поменяли передние. Теперь на лежачих полицейских не болтает.',
    },
    en: {
      author: 'Mary-Jane K.',
      subject: 'Suspension',
      text: 'The car kept bouncing after every bump. They explained the shocks were leaking and replaced the front pair. Speed bumps feel normal again.',
    },
  },
];
