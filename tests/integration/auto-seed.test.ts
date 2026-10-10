import type {} from '@payloadcms/db-postgres';
import { isReviewAuthor } from '@mrshkn/demo-core/cms/reviews';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload, type Payload, type SanitizedConfig } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AutoNode, AutoSymptom, WhereItHurts } from '../../apps/auto/src/cms/types';
import resetTestDatabase from './setup';

type SelectSymptom = (data: WhereItHurts, symptomKey: string) => { symptom: AutoSymptom; node: AutoNode } | null;

const AUTO_SRC = path.resolve(import.meta.dirname, '../../apps/auto/src');

/** Модуль демо «Автосервис»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importAuto = async <T>(relative: string): Promise<T> => {
  const file = path.join(AUTO_SRC, relative);

  expect(existsSync(file), `нет apps/auto/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let getWhereItHurts: (payload: Payload, lang: 'ru' | 'en') => Promise<WhereItHurts>;
let seedAuto: (payload: Payload) => Promise<void>;
let selectSymptom: SelectSymptom;

const NODE_KEYS = ['engine', 'suspension', 'brakes', 'steering', 'electrics', 'cooling', 'exhaust', 'transmission'];

const CYRILLIC = /[А-Яа-яЁё]/;

type Doc = { id: number | string };

let payload: Payload;

const docsOf = async <T extends Doc>(collection: 'nodes' | 'symptoms' | 'reviews', locale?: 'ru' | 'en') =>
  (await payload.find({ collection, locale, depth: 0, limit: 0 })).docs as unknown as T[];

const countOf = async (collection: 'nodes' | 'symptoms' | 'reviews') => (await payload.count({ collection })).totalDocs;

/**
 * У шаблона и «Автосервиса» разные схемы, а база интеграционных тестов одна: файл начинает и заканчивает на пустой
 * схеме, чтобы Payload соседнего файла не спрашивал в терминале о потере данных.
 */
beforeAll(async () => {
  const { default: config } = await importAuto<{ default: Promise<SanitizedConfig> }>('payload.config.ts');

  ({ getWhereItHurts } = await importAuto<{ getWhereItHurts: typeof getWhereItHurts }>('cms/queries.ts'));
  ({ seedAuto } = await importAuto<{ seedAuto: typeof seedAuto }>('cms/seed/seed.ts'));
  ({ selectSymptom } = await importAuto<{ selectSymptom: SelectSymptom }>('lib/where-it-hurts.ts'));

  await resetTestDatabase();
  payload = await getPayload({ config, key: 'auto-seed' });
});

afterAll(async () => {
  await payload?.destroy();
  await resetTestDatabase();
});

describe('засев демо «Автосервис»', () => {
  it('засев создает 8 узлов «где болит»', async () => {
    const nodes = await docsOf<Doc & { key: string }>('nodes');

    expect(await countOf('nodes')).toBe(8);
    expect(nodes.map(({ key }) => key).sort()).toEqual([...NODE_KEYS].sort());
  });

  it.each(['ru', 'en'] as const)('у каждого узла на %s есть симптом, причины, цена «от» и срок', async (lang) => {
    const { nodes, symptoms } = await getWhereItHurts(payload, lang);

    expect(nodes).toHaveLength(8);

    for (const node of nodes) {
      expect(node.name.trim(), node.key).not.toBe('');
      expect(node.causes.length, node.key).toBeGreaterThanOrEqual(1);

      for (const cause of node.causes) {
        expect(cause.text.trim(), node.key).not.toBe('');
        expect(cause.term.trim(), `${node.key}: ${cause.text}`).not.toBe('');
        expect(Number.isInteger(cause.price), `${node.key}: ${cause.text}`).toBe(true);
        expect(cause.price, `${node.key}: ${cause.text}`).toBeGreaterThan(0);
      }

      expect(
        symptoms.filter((symptom) => symptom.node === node.key).length,
        `симптомы узла ${node.key}`,
      ).toBeGreaterThanOrEqual(1);
    }

    for (const symptom of symptoms) {
      expect(symptom.text.trim(), symptom.key).not.toBe('');
    }
  });

  it('каждый симптом ссылается на существующий узел', async () => {
    const nodeIds = (await docsOf('nodes')).map(({ id }) => id);
    const symptoms = await docsOf<Doc & { key: string; node: number | string }>('symptoms');

    expect(symptoms.length).toBeGreaterThan(0);

    for (const symptom of symptoms) {
      expect(nodeIds, symptom.key).toContain(symptom.node);
    }

    const data = await getWhereItHurts(payload, 'ru');

    expect(data.symptoms).toHaveLength(symptoms.length);

    for (const symptom of data.symptoms) {
      expect(selectSymptom(data, symptom.key)?.node.key, symptom.key).toBe(symptom.node);
    }
  });

  it('английские тексты не подменены русскими', async () => {
    const en = await getWhereItHurts(payload, 'en');
    const ru = await getWhereItHurts(payload, 'ru');
    const englishTexts = [
      ...en.nodes.flatMap((node) => [node.name, ...node.causes.flatMap((cause) => [cause.text, cause.term])]),
      ...en.symptoms.map((symptom) => symptom.text),
    ];

    expect(englishTexts.length).toBeGreaterThan(0);

    for (const text of englishTexts) {
      expect(text).not.toMatch(CYRILLIC);
    }

    expect(ru.nodes).toHaveLength(8);

    for (const node of ru.nodes) {
      expect(node.name, node.key).toMatch(CYRILLIC);
    }
  });

  it('повторный засев ничего не дублирует', async () => {
    const before = {
      nodes: await countOf('nodes'),
      symptoms: await countOf('symptoms'),
      reviews: await countOf('reviews'),
    };

    expect(before.nodes).toBeGreaterThan(0);

    await seedAuto(payload);

    expect({
      nodes: await countOf('nodes'),
      symptoms: await countOf('symptoms'),
      reviews: await countOf('reviews'),
    }).toEqual(before);
  });

  it('отзывы засеяны на обоих языках с подписью своего языка', async () => {
    const ru = await docsOf<Doc & { author: string; text: string }>('reviews', 'ru');
    const en = await docsOf<Doc & { author: string; text: string }>('reviews', 'en');

    expect(ru.length).toBeGreaterThanOrEqual(3);
    expect(en.length).toBeGreaterThanOrEqual(3);

    for (const { author } of ru) {
      expect(isReviewAuthor(author, 'ru'), author).toBe(true);
    }

    for (const { author, text } of en) {
      expect(isReviewAuthor(author, 'en'), author).toBe(true);
      expect(text, author).not.toMatch(CYRILLIC);
    }
  });
});
