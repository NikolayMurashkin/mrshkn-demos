import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Lang = 'ru' | 'en';

type TextsModule = { TEXTS: Record<Lang, unknown> };

const EVENT_SRC = path.resolve(import.meta.dirname, '../../apps/event/src');

/** Модуль демо «Концерт»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importEvent = async <T>(relative: string): Promise<T> => {
  const file = path.join(EVENT_SRC, relative);

  expect(existsSync(file), `нет apps/event/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const loadTexts = async () => (await importEvent<TextsModule>('texts.ts')).TEXTS;

const CYRILLIC = /[А-Яа-яЁё]/;

/** Короткое слово целиком (без буквы или цифры перед ним), за которым обычный пробел. */
const SHORT_WORD_SPACE = /(?<![\p{L}\p{N}])(в|к|с|на|и|у|о) /iu;

/** Число и единица через обычный пробел. */
const NUMBER_UNIT_SPACE = /\d (₽|мин|лет|минут)(?!\p{L})/u;

/** Листья словаря: путь ключа через точку (индекс массива — тоже ключ) и значение. */
const leaves = (value: unknown, prefix = ''): [string, unknown][] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, item]) => leaves(item, prefix ? `${prefix}.${key}` : key))
    : [[prefix, value]];

/** Все ключи на всех уровнях, вместе с промежуточными: у массивов разной длины разный набор индексов. */
const allKeys = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, item]) => {
        const full = prefix ? `${prefix}.${key}` : key;

        return [full, ...allKeys(item, full)];
      })
    : [];

const strings = (texts: unknown) =>
  leaves(texts).filter((leaf): leaf is [string, string] => typeof leaf[1] === 'string');

const valueAt = (texts: unknown, key: string) =>
  key
    .split('.')
    .reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as never)[part] : undefined), texts);

/** Неразрывные пробелы по правилам репозитория: после «в», «к», «с», «на», «и», «у», «о» и между числом и единицей. */
const nb = (text: string) =>
  text
    .replace(/(?<![\p{L}\p{N}])(в|к|с|на|и|у|о) /giu, '$1\u00a0')
    .replace(/(\d) (₽|мин|лет|минут)(?!\p{L})/gu, '$1\u00a0$2');

/** Утвержденные тексты страницы: ru — как в таблице, неразрывные пробелы ставит `nb`. */
const APPROVED: [key: string, ru: string, en: string][] = [
  ['meta.title', 'Квартет «Медленный прилив» — джаз в Калининграде', 'Slow Tide Quartet — jazz in Kaliningrad'],
  [
    'meta.description',
    'Квартет «Медленный прилив» в клубе «Причал 9»: программа вечера, адрес, билеты. Концерт вымышленный — это пример сайта от студии MRSHKN.',
    "Slow Tide Quartet at Pier 9 club: the evening's programme, address, tickets. The concert is fictional — a sample website by MRSHKN studio.",
  ],
  ['header.home', 'Медленный прилив', 'Slow Tide'],
  ['header.langLabel', 'Язык', 'Language'],
  ['hero.kicker', 'Джаз в Калининграде · 12+', 'Jazz in Kaliningrad · 12+'],
  ['hero.title', 'Медленный прилив', 'Slow Tide'],
  [
    'hero.lead',
    'Квартет играет известный джаз и свою музыку — «Огни на воде»',
    'The quartet plays well-known jazz and its own music, Lights on the Water',
  ],
  ['hero.time', 'начало в 19:00', 'starts at 7 pm'],
  ['hero.city', 'Калининград, клуб «Причал 9»', 'Kaliningrad, Pier 9 club'],
  ['hero.buy', 'Купить билет', 'Buy tickets'],
  ['hero.priceNote', 'от {price} · билеты на Яндекс Афише', 'from {price} · tickets on Yandex Afisha'],
  ['hero.plate', 'Мероприятие вымышленное — это пример сайта', 'This event is fictional — this is a sample website'],
  [
    'hero.plateNote',
    'Билет на этот концерт не продается: кнопки ведут на все события Калининграда на Яндекс Афише',
    'Tickets for this concert are not on sale: the buttons lead to all Kaliningrad events on Yandex Afisha',
  ],
  ['about.title', 'О квартете', 'The quartet'],
  [
    'about.text.0',
    'Квартет «Медленный прилив» — фортепиано, контрабас, барабаны и саксофон.',
    'Slow Tide is a quartet: piano, double bass, drums and saxophone.',
  ],
  [
    'about.text.1',
    'Играют известные джазовые мелодии, которые знают все любители джаза, — каждую по-своему. И свою музыку, которую написали сами. Звучит спокойно: мягкий танцевальный ритм, медленные лирические песни и немного босановы — легкой бразильской музыки. Музыка для вечера без спешки: ее хорошо слушать и в зале, и у бара.',
    'They play well-known jazz tunes that every jazz lover knows — each in their own way. And music they wrote themselves. It sounds calm: a soft dance beat, slow lyrical songs and a little bossa nova — light Brazilian music. Music for an unhurried evening: good to listen to in the hall or at the bar.',
  ],
  ['program.title', 'Программа вечера', 'The evening'],
  ['program.items.0', '18:00 — открываем двери, работает бар', '6 pm — doors open, the bar is open'],
  [
    'program.items.1',
    '19:00 — первое отделение: известные джазовые мелодии',
    '7 pm — first set: well-known jazz tunes',
  ],
  ['program.items.2', '20:00 — антракт 20 минут', '8 pm — 20-minute interval'],
  [
    'program.items.3',
    '20:20 — второе отделение: «Огни на воде», музыка, которую квартет написал сам',
    '8:20 pm — second set: Lights on the Water, music the quartet wrote itself',
  ],
  ['program.items.4', '21:30 — окончание', '9:30 pm — end'],
  ['venue.title', 'Где проходит концерт', 'Where it takes place'],
  ['venue.name', 'Клуб «Причал 9»', 'Pier 9 club'],
  [
    'venue.text',
    'Небольшой зал на набережной Преголи. В зале три вида мест: первые ряды у самой сцены, партер — ряды в зале за ними и балкон — места наверху, над залом. Бар работает весь вечер.',
    'A small hall on the Pregolya embankment. There are three kinds of seats: front rows right by the stage, the stalls — rows in the hall behind them, and the balcony — seats upstairs, above the hall. The bar is open all evening.',
  ],
  ['venue.address', 'Калининград, ул. Октябрьская', 'Oktyabrskaya St, Kaliningrad'],
  [
    'venue.addressNote',
    'Адрес и точка на карте — для примера: клуба «Причал 9» в Калининграде нет, как нет и самого концерта',
    'The address and the map pin are only an example: there is no Pier 9 club in Kaliningrad, and no concert either',
  ],
  ['venue.howTo', 'Как добраться', 'Getting there'],
  [
    'venue.howToText',
    'Парковка рядом маленькая — удобнее приехать на такси или общественном транспорте. Вход — с набережной.',
    'Parking nearby is small, so a taxi or public transport is easier. The entrance is on the embankment side.',
  ],
  ['tickets.title', 'Билеты', 'Tickets'],
  ['tickets.items.balcony.name', 'Балкон', 'Balcony'],
  [
    'tickets.items.balcony.text',
    'Сцена видна сверху. Мест по номерам нет — садитесь на любое свободное',
    'The stage is seen from above. Seats are not numbered — take any free one',
  ],
  ['tickets.items.parterre.name', 'Партер', 'Stalls'],
  [
    'tickets.items.parterre.text',
    'Ряды в зале, за первыми рядами. Место — по номеру в билете',
    'Rows in the hall, behind the front rows. Your seat is the number on your ticket',
  ],
  ['tickets.items.front.name', 'Первые ряды', 'Front rows'],
  [
    'tickets.items.front.text',
    'Ближе всего к сцене, перед партером. Место — по номеру в билете',
    'Closest to the stage, in front of the stalls. Your seat is the number on your ticket',
  ],
  ['tickets.buy', 'Купить билет', 'Buy tickets'],
  [
    'tickets.note',
    'Этот концерт вымышленный, на Яндекс Афише его нет. Поэтому кнопка «Купить билет» откроет страницу Калининграда на Яндекс Афише со всеми событиями города. На сайте настоящего концерта кнопка ведет сразу на страницу этого концерта на Афише, там и покупают билет. Сайт Афиши откроется отдельно, а эта страница останется открытой.',
    "This concert is fictional and not on Yandex Afisha. So the Buy tickets button opens the Kaliningrad page on Yandex Afisha with all the city's events. On a real concert's website the button leads straight to that concert's page on Afisha, where you buy the ticket. The Afisha website opens separately, and this page stays open.",
  ],
  ['faq.title', 'Частые вопросы', 'Frequently asked questions'],
  ['faq.items.0.q', 'С какого возраста можно прийти?', 'Is there an age limit?'],
  [
    'faq.items.0.a',
    'С 12 лет. Детей до 16 лет пускаем только вместе со взрослым.',
    '12 and over. Under-16s are let in only with an adult.',
  ],
  ['faq.items.1.q', 'Что нужно, чтобы пройти в зал?', 'What do I need to get in?'],
  [
    'faq.items.1.a',
    'Вход открывается в 18:00, концерт начинается в 19:00. На входе покажите билет, который вы получили после покупки на Яндекс Афише: на экране телефона или распечатанный на бумаге.',
    'Doors open at 6 pm, the concert starts at 7 pm. At the entrance, show the ticket you got after buying on Yandex Afisha — on your phone screen or printed on paper.',
  ],
  ['faq.items.2.q', 'Можно вернуть билет?', 'Can I return a ticket?'],
  [
    'faq.items.2.a',
    'Да, через Яндекс Афишу, там же, где вы его купили. Чем раньше вернете билет, тем больше денег получите. Если вернуть билет за 10 дней до концерта или раньше, вернут всю его цену, кроме сервисного сбора Афиши. Если позже — только часть, а меньше чем за 3 дня могут не вернуть ничего. Сколько именно, написано в вашем заказе на Афише.',
    "Yes, through Yandex Afisha, where you bought it. The earlier you return the ticket, the more you get back. If you return it 10 days before the concert or earlier, you get the full price back, except Afisha's service fee. Later, only part of it, and less than 3 days before the concert you may get nothing back. The exact amount is in your Afisha order.",
  ],
  ['gallery.title', 'С прошлых концертов', 'From past concerts'],
  [
    'finale.note',
    'от {price} · концерт вымышленный, поэтому кнопка откроет все события Калининграда на Яндекс Афише',
    'from {price} · the concert is fictional, so the button opens all Kaliningrad events on Yandex Afisha',
  ],
];

describe('тексты страницы концерта', () => {
  it('X1: у TEXTS.ru и TEXTS.en одинаковый набор ключей на всех уровнях, массивы одной длины', async () => {
    const texts = await loadTexts();
    const ruKeys = allKeys(texts.ru).sort();

    expect(ruKeys.length).toBeGreaterThan(0);
    expect(allKeys(texts.en).sort()).toEqual(ruKeys);
  });

  it('X2: в строках TEXTS.en нет кириллицы', async () => {
    const texts = await loadTexts();
    const en = strings(texts.en);

    expect(en.length).toBeGreaterThan(0);

    for (const [key, text] of en) {
      expect(text, `en.${key}`).not.toMatch(CYRILLIC);
    }
  });

  it('X3: в строках TEXTS.ru нет «ё», после коротких слов и между числом и единицей — неразрывный пробел', async () => {
    const texts = await loadTexts();
    const ru = strings(texts.ru);

    expect(ru.length).toBeGreaterThan(0);

    for (const [key, text] of ru) {
      expect(text, `ru.${key}: «ё»`).not.toMatch(/[ёЁ]/);
      expect(text, `ru.${key}: обычный пробел после короткого слова`).not.toMatch(SHORT_WORD_SPACE);
      expect(text, `ru.${key}: обычный пробел между числом и единицей`).not.toMatch(NUMBER_UNIT_SPACE);
    }
  });

  it('X4: плашка первого экрана — дословно «Мероприятие вымышленное — это пример сайта» и перевод', async () => {
    const texts = await loadTexts();

    expect(valueAt(texts.ru, 'hero.plate')).toBe('Мероприятие вымышленное — это пример сайта');
    expect(valueAt(texts.en, 'hero.plate')).toBe('This event is fictional — this is a sample website');
  });

  it.each(APPROVED)('X5: %s — утвержденный текст ru и en дословно', async (key, ru, en) => {
    const texts = await loadTexts();

    expect(valueAt(texts.ru, key), `ru.${key}`).toBe(nb(ru));
    expect(valueAt(texts.en, key), `en.${key}`).toBe(en);
  });
});
