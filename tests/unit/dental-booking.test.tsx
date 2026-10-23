/** @vitest-environment happy-dom */
import type { DemoConfig } from '@mrshkn/demo-core/types';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DEMO as AUTO_DEMO, DEMOS as AUTO_DEMOS } from '../../apps/auto/src/demo.config';
import { DEMO as COFFEE_DEMO } from '../../apps/coffee/src/demo.config';
import { DEMO as DENTAL_DEMO } from '../../apps/dental/src/demo.config';
import { DEMO as EXPERT_DEMO } from '../../apps/expert/src/demo.config';
import { DEMO as LAUNCH_DEMO } from '../../apps/launch/src/demo.config';
import { DEMO as TEMPLATE_DEMO } from '../../apps/template/src/demo.config';

/**
 * Контент страниц вместо CMS: по одной услуге, врачу и отзыву — форма `Service`, `Doctor`, `Review` из payload-types
 * «Клиники». Типы оттуда не импортируются: их `declare module 'payload'` подменил бы типы Payload всем тестам корня.
 */
const fixtures = vi.hoisted(() => {
  const createdAt = '2026-10-01T00:00:00.000Z';
  const service = {
    id: 1,
    title: 'Лечение кариеса',
    slug: 'caries',
    summary: 'Пломба за один визит.',
    priceFrom: 4500,
    description: 'Сначала снимок, потом лечение.',
    prices: [{ id: 'filling', name: 'Пломба', price: 4500, from: true }],
    updatedAt: createdAt,
    createdAt,
  };
  const doctor = {
    id: 1,
    name: 'Иванова Анна Сергеевна',
    slug: 'ivanova',
    position: 'Стоматолог-терапевт',
    practiceSince: 2012,
    about: 'Лечит кариес и пульпит.',
    education: [{ id: 'university', item: 'Медицинский университет, 2011' }],
    services: [service],
    updatedAt: createdAt,
    createdAt,
  };
  const review = {
    id: 1,
    author: 'Ирина С.',
    text: 'Все объяснили до начала лечения.',
    subject: 'Лечение кариеса',
    updatedAt: createdAt,
    createdAt,
  };

  return { service, doctor, review };
});

vi.mock('../../apps/dental/src/cms/queries', () => ({
  getServices: async () => [fixtures.service],
  getService: async () => fixtures.service,
  getDoctors: async () => [fixtures.doctor],
  getDoctor: async () => fixtures.doctor,
  getDoctorsOfService: async () => [fixtures.doctor],
  getReviews: async () => [fixtures.review],
}));

/** Меню шапки — клиентский компонент с текущим адресом; фикстуры находятся, страница 404 не отдает. */
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  notFound: () => {
    throw new Error('notFound: фикстура страницы не нашлась');
  },
}));

const TG = 'https://t.me/mrshkn_dental_bot';

const MAX = 'https://max.ru/se14753310_bot?startapp';

/** Подписи из раздела «Тексты» тест-плана: после «в» — неразрывный пробел, обычный пробел — другая подпись. */
const TG_LABEL = 'Записаться в Telegram';

const MAX_LABEL = 'Записаться в MAX';

const HEADER_LABEL = 'Записаться';

const SAFE_REL = new Set(['noopener', 'noreferrer']);

type PageProps = { params: Promise<{ slug: string }> };

type PageModule<Props> = { default: (props: Props) => ReactNode | Promise<ReactNode> };

type HeaderModule = { Header: () => ReactNode };

const DENTAL_SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

/** Модуль «Клиники» по пути: его `@/` разрешает плагин vitest, а не tsconfig корня (там `@/` — шаблон). */
const importDental = async <T,>(relative: string): Promise<T> => {
  const file = path.join(DENTAL_SRC, relative);

  expect(existsSync(file), `нет apps/dental/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

const parse = (node: ReactNode) =>
  new DOMParser().parseFromString(`<body>${renderToStaticMarkup(<>{node}</>)}</body>`, 'text/html').body;

/** Блок страницы, где стоит запись: hero главной или головка страницы врача и услуги. */
const sectionOf = (body: HTMLElement, labelledBy: string) => {
  const section = body.querySelector(`section[aria-labelledby="${labelledBy}"]`);

  expect(section, `section[aria-labelledby="${labelledBy}"]`).not.toBeNull();

  return section;
};

const anchorsOf = (root: Element | null) => [...(root?.querySelectorAll('a') ?? [])];

const linksTo = (root: Element | null, href: string) =>
  anchorsOf(root).filter((anchor) => anchor.getAttribute('href') === href);

const relOf = (anchor: Element | undefined) =>
  new Set((anchor?.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));

/** Обе ссылки записи: по одной, подписи дословно, MAX — в новой вкладке, без доступа к окну сайта, после Telegram. */
const expectBookingLinks = (section: Element | null) => {
  const telegram = linksTo(section, TG);
  const max = linksTo(section, MAX);

  expect(telegram, `ссылка ${TG}`).toHaveLength(1);
  expect(telegram[0]?.textContent).toBe(TG_LABEL);
  expect(max, `ссылка ${MAX}`).toHaveLength(1);
  expect(max[0]?.textContent).toBe(MAX_LABEL);
  expect(max[0]?.getAttribute('target')).toBe('_blank');
  expect(relOf(max[0])).toEqual(SAFE_REL);

  const order: (Element | undefined)[] = anchorsOf(section);

  expect(order.indexOf(max[0]), 'MAX после Telegram').toBeGreaterThan(order.indexOf(telegram[0]));
};

describe('«Клиника»: запись в Telegram и MAX на страницах', () => {
  it('D1: первый экран главной — обе ссылки записи с подписями, «Смотреть цены» на месте', async () => {
    const { default: HomePage } = await importDental<PageModule<Record<string, never>>>('app/(site)/page.tsx');
    const hero = sectionOf(parse(await HomePage({})), 'hero-title');

    expectBookingLinks(hero);

    const prices = linksTo(hero, '/prices');

    expect(prices, 'ссылка /prices').toHaveLength(1);
    expect(prices[0]?.textContent).toBe('Смотреть цены');
  });

  it('D2: головка страницы врача — обе ссылки записи с подписями', async () => {
    const { default: DoctorPage } = await importDental<PageModule<PageProps>>('app/(site)/doctors/[slug]/page.tsx');
    const page = await DoctorPage({ params: Promise.resolve({ slug: fixtures.doctor.slug }) });

    expectBookingLinks(sectionOf(parse(page), 'page-title'));
  });

  it('D3: головка страницы услуги — обе ссылки записи с подписями', async () => {
    const { default: ServicePage } = await importDental<PageModule<PageProps>>('app/(site)/services/[slug]/page.tsx');
    const page = await ServicePage({ params: Promise.resolve({ slug: fixtures.service.slug }) });

    expectBookingLinks(sectionOf(parse(page), 'page-title'));
  });

  it('D4: шапка — только запись в Telegram с прежней подписью, ссылок на max.ru нет', async () => {
    const { Header } = await importDental<HeaderModule>('components/Header/index.ts');
    const header = parse(<Header />);

    expect(anchorsOf(header).filter((anchor) => anchor.getAttribute('href')?.startsWith('https://max.ru'))).toEqual([]);

    const telegram = linksTo(header, TG);

    expect(telegram, `ссылка ${TG}`).toHaveLength(1);
    expect(telegram[0]?.textContent).toBe(HEADER_LABEL);
  });
});

type ConfigRow = {
  app: string;
  configs: DemoConfig[];
  expected: Partial<Pick<DemoConfig, 'maxAppUrl' | 'miniAppUrl'>>;
};

/** Бот MAX есть только у «Клиники»; остальные демо без адреса MAX выглядят как раньше. */
const CONFIG_ROWS: ConfigRow[] = [
  { app: 'dental', configs: [DENTAL_DEMO], expected: { maxAppUrl: MAX, miniAppUrl: TG } },
  { app: 'template', configs: [TEMPLATE_DEMO], expected: { maxAppUrl: undefined } },
  { app: 'expert', configs: [EXPERT_DEMO], expected: { maxAppUrl: undefined } },
  { app: 'coffee', configs: [COFFEE_DEMO], expected: { maxAppUrl: undefined } },
  { app: 'launch', configs: [LAUNCH_DEMO], expected: { maxAppUrl: undefined } },
  { app: 'auto', configs: [...Object.values(AUTO_DEMOS), AUTO_DEMO], expected: { maxAppUrl: undefined } },
];

describe('адрес Mini App «Запись» в MAX в конфигах демо', () => {
  it.each(CONFIG_ROWS)('D5: $app — maxAppUrl по демо', ({ app, configs, expected }) => {
    for (const config of configs) {
      for (const [key, value] of Object.entries(expected)) {
        expect(config[key as keyof typeof expected], `${app}: ${key}`).toBe(value);
      }
    }
  });
});
