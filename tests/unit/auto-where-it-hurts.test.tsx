/** @vitest-environment happy-dom */
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AutoNode, AutoSymptom, WhereItHurts } from '../../apps/auto/src/cms/types';

type NodeCardProps = { node: AutoNode; lang: 'ru' | 'en' };

type SelectSymptom = (data: WhereItHurts, symptomKey: string) => { symptom: AutoSymptom; node: AutoNode } | null;

const AUTO_SRC = path.resolve(import.meta.dirname, '../../apps/auto/src');

/** Модуль демо «Автосервис»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importAuto = async <T,>(relative: string): Promise<T> => {
  const file = path.join(AUTO_SRC, relative);

  expect(existsSync(file), `нет apps/auto/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let NodeCard: ComponentType<NodeCardProps>;
let selectSymptom: SelectSymptom;

beforeAll(async () => {
  ({ NodeCard } = await importAuto<{ NodeCard: ComponentType<NodeCardProps> }>('components/NodeCard/index.ts'));
  ({ selectSymptom } = await importAuto<{ selectSymptom: SelectSymptom }>('lib/where-it-hurts.ts'));
});

const CYRILLIC = /[А-Яа-яЁё]/;

const ENGINE: AutoNode = {
  key: 'engine',
  name: 'Двигатель и цепь ГРМ',
  causes: [
    { text: 'Растянулась цепь ГРМ или износился натяжитель', price: 18000, term: '1–2 дня' },
    { text: 'Заедает фазорегулятор распредвала', price: 6500, term: '4–6 ч' },
    { text: 'Подсос воздуха во впуске', price: 2000, term: '30 мин' },
  ],
};

const ENGINE_EN: AutoNode = {
  key: 'engine',
  name: 'Engine and timing chain',
  causes: [
    { text: 'Stretched timing chain or worn tensioner', price: 250, term: '1–2 days' },
    { text: 'Sticking cam phaser', price: 480, term: '4–6 h' },
  ],
};

const BRAKES: AutoNode = {
  key: 'brakes',
  name: 'Тормоза',
  causes: [{ text: 'Износились тормозные колодки', price: 1500, term: '1 ч' }],
};

const SUSPENSION: AutoNode = {
  key: 'suspension',
  name: 'Подвеска',
  causes: [{ text: 'Потекли амортизаторы', price: 3500, term: '2–3 ч' }],
};

const DATA: WhereItHurts = {
  nodes: [BRAKES, ENGINE, SUSPENSION],
  symptoms: [
    { key: 'brake-squeal', node: 'brakes', text: 'Скрип при торможении' },
    { key: 'misfire', node: 'engine', text: 'Мотор троит' },
    { key: 'chain-rattle', node: 'engine', text: 'Стук цепи после холодного пуска' },
    { key: 'ghost-noise', node: 'exhaust', text: 'Гул под днищем' },
  ],
};

/** Текст разметки с обычными пробелами вместо неразрывных: типограф и `Intl.NumberFormat` ставят их по-своему. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/[  ]/g, ' ');

const renderCard = (node: AutoNode, lang: 'ru' | 'en') => {
  const markup = renderToStaticMarkup(
    <NodeCard
      node={node}
      lang={lang}
    />,
  );

  return { markup, body: new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body };
};

/** Строки причин: строка таблицы или пункт списка с ценой работы. */
const causeRows = (body: HTMLElement) =>
  [...body.querySelectorAll('tr, li')].map((row) => plain(row.textContent)).filter((text) => /от \d/.test(text));

describe('«где болит»: симптом → узел → карточка', () => {
  it('выбор симптома возвращает его узел и карточку', () => {
    const selected = selectSymptom(DATA, 'chain-rattle');

    expect(selected?.symptom.key).toBe('chain-rattle');
    expect(selected?.symptom).toBe(DATA.symptoms[2]);
    expect(selected?.node).toBe(ENGINE);
    expect(selected?.node.name).toBe('Двигатель и цепь ГРМ');
    expect(selected?.node.causes).toEqual(ENGINE.causes);
  });

  it('неизвестный симптом и симптом без узла — null', () => {
    expect(selectSymptom(DATA, 'no-such-symptom')).toBeNull();
    expect(selectSymptom(DATA, 'ghost-noise')).toBeNull();
  });

  it('карточка узла на ru: имя, каждая причина, цена «от» в рублях, срок', () => {
    const { body } = renderCard(ENGINE, 'ru');
    const text = plain(body.textContent);
    const heading = body.querySelector('h2, h3');
    const rows = causeRows(body);

    expect(plain(heading?.textContent)).toContain(ENGINE.name);

    for (const cause of ENGINE.causes) {
      expect(text).toContain(plain(cause.text));
      expect(text).toContain(cause.term);
    }

    expect(text).toContain('от 18 000 ₽');
    expect(text).toContain('1–2 дня');
    expect(rows).toHaveLength(ENGINE.causes.length);
    expect(rows[0]).toContain('Растянулась цепь ГРМ или износился натяжитель');
    expect(rows[0]).toContain('от 18 000 ₽');
    expect(rows[0]).toContain('1–2 дня');
  });

  it('карточка узла на en: цена «from» в долларах', () => {
    const { markup, body } = renderCard(ENGINE_EN, 'en');
    const text = plain(body.textContent);

    expect(text).toContain('from $250');
    expect(text).toContain('1–2 days');
    expect(markup).not.toMatch(CYRILLIC);
  });

  it('тексты карточки проходят типограф', () => {
    const { body } = renderCard(ENGINE, 'ru');

    expect(body.textContent).toContain('во впуске');
  });
});
