import { NBSP } from '@mrshkn/demo-core/consts';
import { typograph } from '@mrshkn/demo-core/typograph';
import type { AboutSection, BookingField, NavItem, QuizQuestion, QuizResult } from './types';

/** Постоянные сведения о психологе, которые не правят в админке: имя, подпись, как и где принимает. */
export const EXPERT = {
  name: 'Вера Ланская',
  role: 'психолог',
  initials: 'ВЛ',
  ways: typograph('Онлайн и очно'),
  hours: `пн–пт 10:00–20:00`,
};

export const CTA = 'Записаться';

export const BOOKING_HREF = '/booking';

export const NAV: NavItem[] = [
  { href: '/', label: 'Обо мне' },
  { href: '/formats', label: typograph('Форматы и цены') },
  { href: '/articles', label: 'Статьи' },
  { href: '/quiz', label: 'Подходит ли вам' },
];

export const NAV_LABEL = 'Разделы сайта';

export const ABOUT = {
  title: typograph('Помогаю разобраться с тревогой, выгоранием и отношениями'),
  lead: typograph(
    'Я психолог, работаю в когнитивно-поведенческом подходе девять лет. Встречаемся онлайн или в кабинете в Калининграде.',
  ),
  sections: [
    {
      id: 'requests',
      title: 'С чем приходят',
      items: [
        'Тревога и паника',
        'Выгорание и усталость',
        'Самооценка и самокритика',
        'Отношения и конфликты в паре',
        'Переезд, развод, потеря работы',
      ],
    },
    {
      id: 'method',
      title: 'Как я работаю',
      numbered: true,
      items: [
        'На первой встрече формулируем запрос и цель',
        'Договариваемся о частоте и длительности',
        'Между встречами — небольшие задания, чтобы изменения шли не только в кабинете',
        'Раз в несколько встреч сверяемся, движемся ли к цели',
      ],
    },
    {
      id: 'limits',
      title: 'Чего я не делаю',
      items: [
        'Не ставлю диагнозов и не назначаю лекарства',
        'В остром состоянии направляю к психиатру',
        'Не работаю с людьми, которых знаю лично',
      ],
    },
    {
      id: 'education',
      title: 'Образование',
      items: [
        'Клиническая психология, магистратура',
        'Программа подготовки КПТ-терапевтов',
        'Регулярная супервизия и личная терапия',
      ],
    },
  ].map(({ title, items, ...section }) => ({
    ...section,
    title: typograph(title),
    items: items.map(typograph),
  })) satisfies AboutSection[],
};

export const PLATE = {
  title: typograph('Не уверены, нужен ли психолог?'),
  quiz: 'Пройдите короткий тест',
  quizHref: '/quiz',
};

export const FORMATS_PAGE = {
  title: typograph('Форматы и цены'),
  lead: typograph('Начать можно со знакомства: за 30 минут разберем запрос и решим, подходим ли мы друг другу.'),
  rulesTitle: typograph('Оплата и перенос'),
  rules: typograph(
    `Оплата вперед при записи. Перенос или отмена за 24${NBSP}часа — без потерь, позже — встреча считается проведенной.`,
  ),
  bookLabel: (format: string) => typograph(`${format} — записаться`),
};

export const ARTICLES_PAGE = {
  title: 'Статьи',
  lead: typograph('Короткие тексты о тревоге, выгорании и о том, как устроена работа с психологом.'),
  back: 'Статьи',
  toc: 'Содержание',
};

/** Скорость чтения для подписи «N минут чтения»: слов в минуту. */
export const READING_WORDS_PER_MINUTE = 180;

export const READING_SUFFIX = 'чтения';

/** Формы слова «минута» после числа: 1, 2–4, 5 и больше. */
export const MINUTE_FORMS: [string, string, string] = ['минута', 'минуты', 'минут'];

/** Пункт оглавления текущий, пока его заголовок прошел эту долю высоты окна сверху. */
export const TOC_READING_LINE = 0.33;

export const QUIZ_PAGE = {
  title: 'Подходит ли вам',
  lead: typograph('Три коротких вопроса — и станет понятнее, с какого формата начать.'),
  back: 'Назад',
  next: 'Дальше',
  step: (current: number, total: number) => `Шаг ${current} из${NBSP}${total}`,
};

/** Ответ, после которого квиз сначала говорит о срочной помощи, а не о формате. */
export const QUIZ_CRISIS = 'crisis';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'who',
    text: 'С чем хотите прийти?',
    options: [
      { id: 'self', text: 'Со своим состоянием' },
      { id: 'couple', text: 'С отношениями в паре' },
      { id: 'unsure', text: 'Пока не знаю' },
    ],
  },
  {
    id: 'duration',
    text: 'Как давно это беспокоит?',
    options: [
      { id: 'weeks', text: 'Несколько недель' },
      { id: 'months', text: 'Несколько месяцев' },
      { id: 'years', text: 'Больше года' },
    ],
  },
  {
    id: 'state',
    text: 'Насколько вам тяжело сейчас?',
    options: [
      { id: 'ok', text: 'Справляюсь, но хочется лучше' },
      { id: 'hard', text: 'Тяжело, но держусь' },
      { id: QUIZ_CRISIS, text: 'Кажется, я не справлюсь' },
    ],
  },
].map(({ text, options, ...question }) => ({
  ...question,
  text: typograph(text),
  options: options.map((option) => ({ ...option, text: typograph(option.text) })),
}));

export const QUIZ_RESULTS: QuizResult[] = [
  {
    id: 'urgent',
    title: 'Сейчас важнее срочная помощь',
    text: 'Если есть угроза жизни — звоните 112. Можно позвонить на телефон доверия вашего региона. Когда станет легче, приходите на знакомство.',
    phone: '112',
    href: '/booking?format=intro',
    cta: 'Записаться на знакомство',
    urgent: true,
  },
  {
    id: 'couple',
    title: 'Вам подойдет парная сессия',
    text: 'Когда трудности касаются двоих, важно услышать обе стороны. На парной сессии разбираем, что происходит между вами, и ищем, как договориться.',
    href: '/booking?format=couple',
    cta: CTA,
  },
  {
    id: 'intro',
    title: 'Начните со знакомства',
    text: 'За 30 минут разберем, что вас беспокоит, и решим, подходим ли мы друг другу. Встреча ни к чему не обязывает.',
    href: '/booking?format=intro',
    cta: CTA,
  },
  {
    id: 'individual',
    title: 'Вам подойдет индивидуальная работа',
    text: 'То, что беспокоит давно, редко проходит само. На регулярных встречах разберем, что поддерживает трудности, и найдем способы с ними справляться.',
    href: '/booking?format=individual',
    cta: CTA,
  },
].map(({ title, text, cta, ...result }) => ({
  ...result,
  title: typograph(title),
  text: typograph(text),
  cta: typograph(cta),
}));

export const BOOKING_PAGE = {
  title: 'Запись',
  legend: 'Формат',
  name: 'Имя',
  contact: `Телефон или ник в${NBSP}Telegram`,
  when: 'Когда удобно',
  whenHint: `Например: будни после 18:00`,
  comment: 'Комментарий',
  optional: 'необязательно',
  submit: typograph('Перейти к оплате'),
  sending: 'Создаем платеж…',
  note: typograph('Оплата через ЮKassa. После оплаты я напишу в течение рабочего дня и подтвержу время.'),
  invalid: typograph('Проверьте формат, имя, способ связи, удобное время и согласие на обработку данных.'),
  failed: typograph('Не получилось перейти к оплате. Попробуйте еще раз через минуту.'),
  errors: {
    format: 'Выберите формат',
    name: 'Укажите имя',
    contact: typograph('Укажите телефон или ник в Telegram'),
    when: 'Напишите, когда удобно',
    consent: typograph('Нужно согласие на обработку данных'),
  } satisfies Record<BookingField, string>,
};

/** Обязательные поля записи в порядке формы: фокус после неудачной отправки встает на первое незаполненное. */
export const BOOKING_REQUIRED: BookingField[] = ['format', 'name', 'contact', 'when', 'consent'];

export const PAID_PAGE = {
  paidTitle: 'Оплата прошла',
  paidText: typograph('Спасибо! Я напишу вам в течение рабочего дня, чтобы подтвердить время встречи.'),
  pendingTitle: 'Проверяем оплату',
  pendingText: typograph('Обычно это занимает минуту. Обновите страницу чуть позже.'),
  links: [
    { href: '/articles', label: 'Почитать статьи' },
    { href: '/', label: typograph('На главную') },
  ],
  refresh: 'Обновить',
};

export const PRIVACY_PAGE = {
  title: 'Политика обработки персональных данных',
  mark: 'Документ',
};
