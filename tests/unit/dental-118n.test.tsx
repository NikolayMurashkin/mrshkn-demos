/** @vitest-environment happy-dom */
import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import { LOW_VISION_SCHEMES, serializeLowVision } from '@mrshkn/demo-core/low-vision';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCTORS } from '../../apps/dental/src/cms/seed/data';
import { DEMO } from '../../apps/dental/src/demo.config';
import { addressText } from '../../apps/dental/src/lib/format';

/**
 * Контент страниц вместо CMS — два врача и две услуги в форме `Doctor`, `Service` из payload-types «Клиники»
 * с новыми полями. Типы оттуда не импортируются: их `declare module 'payload'` подменил бы типы Payload всем тестам.
 */
const fixtures = vi.hoisted(() => {
  const createdAt = '2026-10-01T00:00:00.000Z';
  const services = [
    {
      id: 1,
      title: 'Лечение кариеса',
      slug: 'caries',
      summary: 'Пломба за один визит.',
      priceFrom: 4500,
      description: 'Сначала снимок, потом лечение.',
      prices: [{ id: 'filling', name: 'Пломба', price: 4500, from: true }],
      updatedAt: createdAt,
      createdAt,
    },
    {
      id: 2,
      title: 'Удаление зубов',
      slug: 'extraction',
      summary: 'Простое и сложное удаление.',
      priceFrom: 3500,
      description: 'Сначала снимок, потом удаление.',
      prices: [{ id: 'simple', name: 'Удаление зуба', price: 3500 }],
      updatedAt: createdAt,
      createdAt,
    },
  ];
  const doctors = [
    {
      id: 1,
      name: 'Иванова Анна Сергеевна',
      slug: 'ivanova',
      position: 'Стоматолог-терапевт',
      practiceSince: 2012,
      about: 'Лечит кариес и пульпит.',
      education: [{ id: 'university', item: 'Медицинский университет, 2011' }],
      services: [services[0]],
      accreditation: {
        kind: 'accreditation',
        specialty: 'Стоматология терапевтическая',
        validUntil: '2029-04-14T22:30:00.000Z',
      },
      schedule: [
        { id: 'a', days: 'Пн, ср, пт', hours: '9:00–15:00' },
        { id: 'b', days: 'Вт, чт', hours: '14:00–21:00' },
      ],
      updatedAt: createdAt,
      createdAt,
    },
    {
      id: 2,
      name: 'Петров Олег Ильич',
      slug: 'petrov',
      position: 'Ортодонт',
      practiceSince: 2009,
      about: 'Исправляет прикус.',
      education: [{ id: 'university', item: 'Медицинский университет, 2008' }],
      services: [services[1]],
      accreditation: {
        kind: 'certificate',
        specialty: 'Ортодонтия',
        validUntil: '2027-12-01T12:00:00.000Z',
      },
      schedule: [{ id: 'c', days: 'Пн–пт', hours: '10:00–18:00' }],
      updatedAt: createdAt,
      createdAt,
    },
  ];

  return { services, doctors, cookies: new Map<string, string>() };
});

vi.mock('../../apps/dental/src/cms/queries', () => ({
  getServices: async () => fixtures.services,
  getService: async (slug: string) => fixtures.services.find((service) => service.slug === slug) ?? null,
  getDoctors: async () => fixtures.doctors,
  getDoctor: async (slug: string) => fixtures.doctors.find((doctor) => doctor.slug === slug) ?? null,
  getDoctorsOfService: async () => fixtures.doctors,
  getReviews: async () => [],
}));

/** Меню шапки — клиентский компонент с текущим адресом; фикстуры находятся, страница 404 не отдает. */
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  notFound: () => {
    throw new Error('notFound: фикстура страницы не нашлась');
  },
}));

/** Cookie запроса задает тест: layout читает их на сервере. */
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      fixtures.cookies.has(name) ? { name, value: fixtures.cookies.get(name) as string } : undefined,
    has: (name: string) => fixtures.cookies.has(name),
    getAll: () => [...fixtures.cookies].map(([name, value]) => ({ name, value })),
  }),
}));

/** Шрифт next/font собирает компилятор Next; в Vitest его нет. */
vi.mock('next/font/local', () => ({ default: () => ({ className: 'font', style: { fontFamily: 'Geologica' } }) }));

const NB = ' ';

const SITE = 'https://dental.mrshkn.com';

const REGISTRY_URL = 'https://roszdravnadzor.gov.ru/services/licenses';

const CLINIC_TIME_ZONE = 'Europe/Kaliningrad';

const PANEL_LABEL = 'Настройки версии для слабовидящих';

const TOGGLE_LABEL = 'Версия для слабовидящих';

/** Строки раздела «Тексты» тест-плана: неразрывный пробел — после коротких слов и перед тире. */
const TEXTS = {
  doctorBlock: 'Аккредитация и график приема',
  accreditation: 'Аккредитация специалиста',
  certificate: 'Сертификат специалиста',
  accreditationNote:
    'Аккредитация специалиста — документ, который дает врачу право лечить по этой специальности. Право действует, пока не вышел срок, указанный в строке.',
  certificateNote:
    'Сертификат специалиста — документ прежнего образца. Пока не вышел срок, он дает врачу право лечить по этой специальности.',
  infoTitle: `Сведения о${NB}клинике`,
  infoLead: `Здесь собраны основные сведения, которые клиника по${NB}закону должна показывать на${NB}своем сайте (приказ Минздрава России №${NB}118н): реквизиты, лицензия, правила записи и${NB}платных услуг. Клиника «Точно» вымышленная, этот сайт сделан как образец. Поэтому в${NB}реквизитах и${NB}номере лицензии стоят нули: номер выглядит как настоящий, но${NB}не${NB}совпадает ни${NB}с${NB}одной реальной клиникой.`,
  organization: 'Организация',
  fullNameLabel: 'Полное наименование',
  fullName: `Общество с${NB}ограниченной ответственностью «Точно»`,
  ogrnLabel: `ОГРН (регистрационный номер компании в${NB}госреестре)`,
  addressLabel: 'Адрес',
  phoneLabel: 'Телефон',
  hoursLabel: 'Часы работы',
  license: 'Лицензия',
  qrCaption: `Наведите камеру телефона на${NB}QR-код, и${NB}откроется государственный реестр лицензий Росздравнадзора${NB}— ведомства, которое следит за${NB}клиниками. Там можно проверить, что лицензия настоящая. У${NB}настоящей клиники код открывает запись именно о${NB}ней. У${NB}нашей вымышленной клиники такой записи нет, поэтому код открывает реестр целиком.`,
  registryLink: `Проверить лицензию в${NB}реестре Росздравнадзора`,
  directions: 'Как добраться',
  bookingRulesTitle: `Правила записи на${NB}первичный (первый) прием`,
  paidRulesTitle: 'Правила предоставления платных медицинских услуг',
  paidRulesLead: `Как мы лечим за${NB}деньги: план, договор, цены, справка для${NB}налоговой.`,
  bookingRules: [
    `Записаться можно тремя способами: в${NB}Telegram, в${NB}мессенджере MAX или по${NB}телефону +7${NB}952${NB}173-02-30. Кнопка Telegram есть на${NB}каждой странице сайта, кнопка MAX${NB}— на${NB}главной, на${NB}страницах врачей и${NB}услуг. Звонки принимаем ежедневно с${NB}9:00 до${NB}21:00.`,
    `При${NB}записи назовите имя и${NB}удобное время. Если знаете, к${NB}какому врачу или на${NB}какую услугу хотите, скажите и${NB}это.`,
    'Администратор подтвердит запись сообщением или звонком.',
    `На${NB}первый прием возьмите паспорт. Если раньше лечили зубы в${NB}другой клинике и${NB}у${NB}вас остались снимки зубов или выписки, захватите и${NB}их.`,
    `Не${NB}получается прийти${NB}— предупредите нас хотя бы за${NB}3${NB}часа до${NB}приема по${NB}телефону или в${NB}том же мессенджере, где записывались, и${NB}мы перенесем запись. Штрафов за${NB}отмену нет.`,
    `Ребенка до${NB}15${NB}лет приводит родитель или другой законный представитель${NB}— например, опекун.`,
  ],
  paidRules: [
    `Клиника оказывает платные медицинские услуги по${NB}Правилам, утвержденным постановлением Правительства РФ от${NB}11.05.2023 №${NB}736. Это общие правила для${NB}всех клиник, которые лечат за${NB}деньги.`,
    `До${NB}начала лечения врач составляет план лечения с${NB}ценой. Сумма в${NB}плане не${NB}меняется без${NB}вашего согласия.`,
    `С${NB}каждым пациентом клиника заключает договор на${NB}оказание платных медицинских услуг.`,
    `Все услуги и${NB}цены${NB}— на${NB}странице «Цены».`,
    `Если вы платили за${NB}лечение сами, часть денег можно вернуть через налоговую${NB}— это называется налоговый вычет. Для${NB}него нужна справка об${NB}оплате медицинских услуг. Мы выдаем ее за${NB}один день.`,
  ],
  footerLinks: [
    { href: '/info', label: 'Сведения о клинике' },
    { href: '/search', label: 'Поиск по сайту' },
    { href: '/survey', label: 'Анкета оценки качества услуг' },
  ],
  policyCookie: `Cookie${NB}— это маленькие файлы-заметки, которые сайт сохраняет в${NB}вашем браузере. Наш сайт сохраняет не${NB}больше двух. Первая запоминает, что вы закрыли сообщение о${NB}cookie, чтобы оно не${NB}появлялось снова. Вторая запоминает настройки версии для слабовидящих (размер шрифта, цвета), если вы ее включали. Тем, кто ведет сайт и${NB}входит в${NB}панель управления сайтом, ставится еще одна cookie, чтобы не${NB}вводить пароль на${NB}каждой странице. Программ, которые следят за${NB}посетителями для статистики или рекламы, на${NB}сайте нет.`,
  policySurvey: `В${NB}анкете мы не${NB}спрашиваем имя, телефон и${NB}почту. Сохраняются только ваши оценки и${NB}комментарий. Еще сайт видит IP-адрес${NB}— сетевой номер вашего устройства или интернет-подключения. По${NB}нему сайт не${NB}дает отправить слишком много анкет подряд. IP-адрес хранится только в${NB}памяти сервера около 10${NB}минут, потом стирается; в${NB}базу он не${NB}записывается и${NB}вместе с${NB}анкетой не${NB}сохраняется.`,
  policyOneCookie: 'Сайт ставит одну cookie',
};

/** Засев врачей из раздела «Тексты»: у всех аккредитация, дата — день по Калининграду. */
const SEED_DOCTORS = {
  lisitsyna: {
    kind: 'accreditation',
    specialty: 'Стоматология терапевтическая',
    day: '2029-04-15',
    schedule: [
      { days: 'Пн, ср, пт', hours: '9:00–15:00' },
      { days: 'Вт, чт', hours: '15:00–21:00' },
    ],
  },
  berezhnoy: {
    kind: 'accreditation',
    specialty: 'Стоматология хирургическая',
    day: '2028-09-20',
    schedule: [{ days: 'Пн–пт', hours: '10:00–18:00' }],
  },
  koltsova: {
    kind: 'accreditation',
    specialty: 'Ортодонтия',
    day: '2030-02-03',
    schedule: [{ days: 'Вт, чт, сб', hours: '9:00–17:00' }],
  },
  shumeyko: {
    kind: 'accreditation',
    specialty: 'Стоматология ортопедическая',
    day: '2028-11-30',
    schedule: [
      { days: 'Пн, ср', hours: '12:00–20:00' },
      { days: 'Сб', hours: '10:00–15:00' },
    ],
  },
  vetrova: {
    kind: 'accreditation',
    specialty: 'Стоматология детская',
    day: '2029-06-12',
    schedule: [{ days: 'Пн–пт', hours: '9:00–14:00' }],
  },
  tarnovsky: {
    kind: 'accreditation',
    specialty: 'Стоматология хирургическая',
    day: '2028-03-25',
    schedule: [{ days: 'Ежедневно', hours: '9:00–21:00' }],
  },
  mezentseva: {
    kind: 'accreditation',
    specialty: 'Стоматология профилактическая',
    day: '2029-10-08',
    schedule: [{ days: 'Ср, пт, вс', hours: '11:00–20:00' }],
  },
};

type PageModule<Props> = { default: (props: Props) => ReactNode | Promise<ReactNode> };

type SlugProps = { params: Promise<{ slug: string }> };

type SitemapModule = {
  default: () => Promise<{ url: string }[]> | { url: string }[];
  dynamic?: string;
};

type ConstsModule = {
  ORGANIZATION?: { fullName: string; ogrn: string };
  LICENSE: { number: string; date: string; issuer: string; activities: string[]; registryUrl?: string };
  BOOKING_RULES?: string[];
  PAID_SERVICES_RULES?: string[];
  DIRECTIONS_TEXT: string;
};

type QrModule = { qrSvg: (url: string) => Promise<string> };

type LayoutModule = { default: (props: { children: ReactNode }) => ReactNode | Promise<ReactNode> };

type SeedDoctorWith118n = {
  slug: string;
  accreditation?: { kind: string; specialty: string; validUntil: string };
  schedule?: { days: string; hours: string }[];
};

/** Политика с новыми пропсами ядра: пока их нет в типе, тест описывает их сам. */
type PolicyProps = Parameters<typeof PrivacyPolicy>[0] & { withLowVision?: boolean; withSurvey?: boolean };

const Policy = PrivacyPolicy as (props: PolicyProps) => ReactNode;

const DENTAL_SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

/** Модуль «Клиники» по пути: его `@/` разрешает плагин vitest; нет файла — тест падает на assert, а не на сборке. */
const importDental = async <T,>(relative: string): Promise<T> => {
  const file = path.join(DENTAL_SRC, relative);

  expect(existsSync(file), `нет apps/dental/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

/** Текст с обычными пробелами вместо неразрывных: где тест не сверяет типографику. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/ /g, ' ');

const parse = (node: ReactNode) =>
  new DOMParser().parseFromString(`<body>${renderToStaticMarkup(<>{node}</>)}</body>`, 'text/html').body;

const dayIn = (iso: string | undefined, timeZone: string) =>
  iso === undefined
    ? undefined
    : new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
        new Date(iso),
      );

const renderDoctor = async (slug: string) => {
  const { default: DoctorPage } = await importDental<PageModule<SlugProps>>('app/(site)/doctors/[slug]/page.tsx');

  return parse(await DoctorPage({ params: Promise.resolve({ slug }) }));
};

const renderInfo = async () => {
  const { default: InfoPage } = await importDental<PageModule<Record<string, never>>>('app/(site)/info/page.tsx');

  return parse(await InfoPage({}));
};

const headingWith = (root: ParentNode, text: string) =>
  [...root.querySelectorAll('h1, h2, h3, h4, h5, h6')].find(
    (heading) => plain(heading.textContent).trim() === plain(text),
  );

/**
 * Дата «действует до» пишется по Калининграду, а не по поясу сервера: процесс теста — в UTC, где у фикстуры
 * врача A другой день.
 */
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'UTC';
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = ORIGINAL_TZ;
  }
});

beforeEach(() => {
  fixtures.cookies.clear();
});

describe('карта сайта «Клиники»', () => {
  it('S1: ровно публичные страницы — разделы, врачи, услуги, сведения, поиск, анкета, политика', async () => {
    const { default: sitemap } = await importDental<SitemapModule>('app/sitemap.ts');
    const urls = (await sitemap()).map(({ url }) => url.replace(/\/$/, ''));
    const expected = [
      '/',
      '/services',
      '/prices',
      '/doctors',
      ...fixtures.doctors.map(({ slug }) => `/doctors/${slug}`),
      ...fixtures.services.map(({ slug }) => `/services/${slug}`),
      '/info',
      '/search',
      '/survey',
      '/privacy',
    ].map((pathname) => `${SITE}${pathname}`.replace(/\/$/, ''));

    expect([...urls].sort()).toEqual([...expected].sort());
  });

  it('S2: карта собирается на запрос — на сборке базы нет', async () => {
    const { dynamic } = await importDental<SitemapModule>('app/sitemap.ts');

    expect(dynamic).toBe('force-dynamic');
  });
});

describe('страница врача: аккредитация и график приема', () => {
  it('D1: аккредитация — подпись, пояснение, специальность, срок по Калининграду и строки графика', async () => {
    const text = plain((await renderDoctor('ivanova')).textContent);

    for (const expected of [
      TEXTS.doctorBlock,
      TEXTS.accreditation,
      TEXTS.accreditationNote,
      'Стоматология терапевтическая',
      'действует до 15.04.2029',
      'Пн, ср, пт',
      '9:00–15:00',
      'Вт, чт',
      '14:00–21:00',
    ]) {
      expect(text, expected).toContain(plain(expected));
    }
  });

  it('D1a: срок документа по Калининграду и при поясе машины UTC', async () => {
    const zone = process.env.TZ;

    try {
      process.env.TZ = 'UTC';
      vi.resetModules();

      const { formatDay } = await import('../../apps/dental/src/lib/format');

      expect(formatDay('2029-04-14T22:30:00.000Z')).toBe('15.04.2029');
    } finally {
      if (zone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = zone;
      }

      vi.resetModules();
    }
  });

  it('D2: сертификат — своя подпись и пояснение, строки аккредитации нет', async () => {
    const text = plain((await renderDoctor('petrov')).textContent);

    for (const expected of [TEXTS.certificate, TEXTS.certificateNote, 'Ортодонтия', 'действует до 01.12.2027']) {
      expect(text, expected).toContain(plain(expected));
    }

    expect(text).not.toContain('Аккредитация специалиста:');
  });

  it('D3: засев — у всех семи врачей аккредитация, специальность, срок и график из «Текстов»', async () => {
    const seeded = Object.fromEntries(
      (DOCTORS as unknown as SeedDoctorWith118n[]).map(({ slug, accreditation, schedule }) => [
        slug,
        {
          kind: accreditation?.kind,
          specialty: accreditation?.specialty,
          day: dayIn(accreditation?.validUntil, CLINIC_TIME_ZONE),
          schedule: schedule?.map(({ days, hours }) => ({ days, hours })),
        },
      ]),
    );
    const { LICENSE } = await importDental<ConstsModule>('consts.ts');

    expect(seeded).toEqual(SEED_DOCTORS);
    expect(LICENSE.activities).toContain('Стоматология профилактическая');
  });
});

describe('страница сведений о клинике', () => {
  it('I1: наименование, адрес, ОГРН из нулей, номер, дата и орган лицензии', async () => {
    const { ORGANIZATION, LICENSE } = await importDental<ConstsModule>('consts.ts');

    expect(ORGANIZATION, 'ORGANIZATION в consts.ts').toEqual({
      fullName: expect.any(String),
      ogrn: expect.any(String),
    });

    const text = plain((await renderInfo()).textContent);

    for (const expected of [
      ORGANIZATION?.fullName ?? '',
      addressText(DEMO.business.address ?? { streetAddress: '', addressLocality: '', addressCountry: '' }),
      'ОГРН',
      ORGANIZATION?.ogrn ?? '',
      LICENSE.number,
      LICENSE.date,
      LICENSE.issuer,
    ]) {
      expect(text, expected).toContain(plain(expected));
    }

    expect(ORGANIZATION?.ogrn).toMatch(/^0{13}$/);
  });

  it('I2: QR-код ведет в реестр лицензий Росздравнадзора, рядом — текстовая ссылка туда же', async () => {
    const { LICENSE } = await importDental<ConstsModule>('consts.ts');

    expect(LICENSE.registryUrl).toBe(REGISTRY_URL);

    const { qrSvg } = await importDental<QrModule>('lib/qr.ts');
    const expected = new DOMParser()
      .parseFromString(`<body>${await qrSvg(REGISTRY_URL)}</body>`, 'text/html')
      .body.querySelector('svg')?.outerHTML;
    const page = await renderInfo();

    expect(expected, 'qrSvg рисует <svg>').toBeDefined();
    expect([...page.querySelectorAll('svg')].map((svg) => svg.outerHTML)).toContain(expected);

    const links = [...page.querySelectorAll(`a[href="${REGISTRY_URL}"]`)];

    expect(links.map((link) => plain(link.textContent).trim())).toContain(plain(TEXTS.registryLink));
  });

  it('I3: правила записи и платных услуг — каждый пункт под своим заголовком; как добраться', async () => {
    const {
      BOOKING_RULES = [],
      PAID_SERVICES_RULES = [],
      DIRECTIONS_TEXT,
    } = await importDental<ConstsModule>('consts.ts');

    expect(BOOKING_RULES.length, 'BOOKING_RULES').toBeGreaterThan(0);
    expect(PAID_SERVICES_RULES.length, 'PAID_SERVICES_RULES').toBeGreaterThan(0);

    const page = await renderInfo();
    const text = plain(page.textContent);

    for (const heading of [TEXTS.bookingRulesTitle, TEXTS.paidRulesTitle, TEXTS.directions]) {
      expect(headingWith(page, heading), `заголовок «${heading}»`).toBeDefined();
    }

    const bookingAt = text.indexOf(plain(TEXTS.bookingRulesTitle));
    const paidAt = text.indexOf(plain(TEXTS.paidRulesTitle));
    /** Раздел правил — от его заголовка до заголовка другого раздела правил, если тот ниже, иначе до конца. */
    const sectionFrom = (start: number, other: number) => text.slice(start, other > start ? other : undefined);

    for (const rule of BOOKING_RULES) {
      expect(sectionFrom(bookingAt, paidAt), rule).toContain(plain(rule));
    }

    for (const rule of PAID_SERVICES_RULES) {
      expect(sectionFrom(paidAt, bookingAt), rule).toContain(plain(rule));
    }

    expect(text).toContain(plain(DIRECTIONS_TEXT));
  });

  it('I4: наименование, правила и подписи страницы — дословно как в «Текстах»', async () => {
    const { ORGANIZATION, BOOKING_RULES, PAID_SERVICES_RULES } = await importDental<ConstsModule>('consts.ts');

    expect(ORGANIZATION?.fullName).toBe(TEXTS.fullName);
    expect(BOOKING_RULES).toEqual(TEXTS.bookingRules);
    expect(PAID_SERVICES_RULES).toEqual(TEXTS.paidRules);

    const text = (await renderInfo()).textContent ?? '';

    for (const label of [
      TEXTS.infoTitle,
      TEXTS.infoLead,
      TEXTS.organization,
      TEXTS.fullNameLabel,
      TEXTS.ogrnLabel,
      TEXTS.addressLabel,
      TEXTS.phoneLabel,
      TEXTS.hoursLabel,
      TEXTS.license,
      TEXTS.qrCaption,
      TEXTS.registryLink,
      TEXTS.directions,
      TEXTS.bookingRulesTitle,
      TEXTS.paidRulesTitle,
      TEXTS.paidRulesLead,
    ]) {
      expect(text, label).toContain(label);
    }
  });
});

describe('layout «Клиники»: версия для слабовидящих с сервера и ссылки на всех страницах', () => {
  const renderLayout = async () => {
    const { default: SiteLayout } = await importDental<LayoutModule>('app/(site)/layout.tsx');
    const markup = renderToStaticMarkup(<>{await SiteLayout({ children: <p>x</p> })}</>);

    return new DOMParser().parseFromString(markup, 'text/html');
  };

  const panelOf = (document: Document) =>
    document.querySelector(`[role="region"][aria-label="${PANEL_LABEL}"], section[aria-label="${PANEL_LABEL}"]`);

  const expectRegularVersion = (document: Document) => {
    expect(document.documentElement.hasAttribute('data-low-vision'), 'data-low-vision у <html>').toBe(false);
    expect(panelOf(document), 'панель настроек').toBeNull();
    expect(document.querySelector(`button[aria-label="${TOGGLE_LABEL}"]`), 'значок в шапке').not.toBeNull();
  };

  it('R1: cookie с настройками — <html> и панель сразу в выбранном режиме', async () => {
    fixtures.cookies.set('low_vision', serializeLowVision({ font: '200', scheme: 'blue-on-lightblue', images: 'off' }));

    const document = await renderLayout();
    const html = document.documentElement;

    expect({
      'data-low-vision': html.getAttribute('data-low-vision'),
      'data-lv-font': html.getAttribute('data-lv-font'),
      'data-lv-scheme': html.getAttribute('data-lv-scheme'),
      'data-lv-images': html.getAttribute('data-lv-images'),
    }).toEqual({
      'data-low-vision': 'on',
      'data-lv-font': '200',
      'data-lv-scheme': 'blue-on-lightblue',
      'data-lv-images': 'off',
    });

    const panel = panelOf(document);

    expect(panel, `панель «${PANEL_LABEL}»`).not.toBeNull();
    expect(panel?.querySelector('button[aria-label="A++, очень крупный шрифт"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );

    /** Цвета схемы приходят в CSS только переменными в `style` у `<html>`: без них режим рисуется прежними цветами. */
    const style = (html.getAttribute('style') ?? '').replace(/\s/g, '').toLowerCase();
    const { text, background } = LOW_VISION_SCHEMES['blue-on-lightblue'];

    expect(style, 'цвет текста схемы').toContain(`--lv-text:${text.toLowerCase()}`);
    expect(style, 'цвет фона схемы').toContain(`--lv-bg:${background.toLowerCase()}`);
  });

  it('R2: без cookie — обычная версия, значок в шапке', async () => {
    expectRegularVersion(await renderLayout());
  });

  it('R3: битая cookie — обычная версия, страница рисуется', async () => {
    fixtures.cookies.set('low_vision', 'мусор');

    expectRegularVersion(await renderLayout());
  });

  it('R4: ссылки на сведения, поиск и анкету и значок версии для слабовидящих', async () => {
    const document = await renderLayout();

    for (const { href, label } of TEXTS.footerLinks) {
      const anchors = [...document.querySelectorAll(`a[href="${href}"]`)];

      expect(
        anchors.map((anchor) => plain(anchor.textContent).trim()),
        href,
      ).toContain(label);
    }

    expect(
      document.querySelector(`button[aria-label="${TOGGLE_LABEL}"]`),
      'значок версии для слабовидящих',
    ).not.toBeNull();
  });
});

describe('политика: cookie версии для слабовидящих и анкета', () => {
  const policyText = (props: Partial<PolicyProps> = {}) =>
    parse(createElement(Policy, { withYandexReviews: false, ...props })).textContent ?? '';

  it('Y1: без новых пропсов текст прежний — одна cookie, абзаца анкеты нет', () => {
    const text = policyText();

    expect(text).toContain(TEXTS.policyOneCookie);
    expect(plain(text)).not.toContain(plain(TEXTS.policySurvey));
  });

  it('Y2: с версией для слабовидящих — абзац о двух cookie вместо одной', () => {
    const text = policyText({ withLowVision: true });

    expect(text).toContain(TEXTS.policyCookie);
    expect(text).not.toContain(TEXTS.policyOneCookie);
  });

  it('Y3: с анкетой — абзац об анкете', () => {
    expect(policyText({ withSurvey: true })).toContain(TEXTS.policySurvey);
  });

  it('Y4: политика «Клиники» — оба новых абзаца', async () => {
    const { default: PrivacyPage } =
      await importDental<PageModule<Record<string, never>>>('app/(site)/privacy/page.tsx');
    const text = parse(await PrivacyPage({})).textContent ?? '';

    expect(text).toContain(TEXTS.policyCookie);
    expect(text).toContain(TEXTS.policySurvey);
  });
});
