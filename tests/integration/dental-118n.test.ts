import type {} from '@payloadcms/db-postgres';
import { HONEYPOT_FIELD } from '@mrshkn/demo-core/consts';
import { createSurveyRoute } from '@mrshkn/demo-core/survey-route';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Forbidden, getPayload, type Payload, type SanitizedConfig } from 'payload';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DOCTORS } from '../../apps/dental/src/cms/seed/data';
import { DEMO } from '../../apps/dental/src/demo.config';
import resetTestDatabase from './setup';

/**
 * Обработчик анкеты и поиск обязаны брать Payload из аргумента и конфига «Клиники». В интеграционных тестах
 * `@payload-config` указывает на конфиг шаблона: кто возьмет его сам, поднимет второй Payload со схемой шаблона на базе
 * «Клиники». Ленивое обещание падает, только если его кто-то ждет.
 */
vi.mock('@payload-config', () => ({
  default: {
    then: (_resolve: unknown, reject: (error: Error) => void) =>
      reject(new Error('анкета или поиск взяли глобальный конфиг Payload, а не конфиг «Клиники»')),
  },
}));

type SearchResult = { kind: string; title: string; href: string };

type SearchModule = { searchClinic: (payload: Payload, query: string) => Promise<SearchResult[]> };

type SurveyDoc = {
  id: number | string;
  information: number;
  comfort: number;
  accessibility?: number | null;
  courtesy: number;
  satisfaction: number;
  comment?: string | null;
  demo: string;
};

const COLLECTION = 'quality-surveys';

const RATINGS = { information: 5, comfort: 4, accessibility: 3, courtesy: 2, satisfaction: 1 };

const FIELDS = ['information', 'comfort', 'accessibility', 'courtesy', 'satisfaction', 'comment', 'demo'];

const DENTAL_SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

/** Модуль «Клиники» по абсолютному пути: `@/` здесь — шаблон; пока файла нет, тест падает на assert. */
const importDental = async <T>(relative: string): Promise<T> => {
  const file = path.join(DENTAL_SRC, relative);

  expect(existsSync(file), `нет apps/dental/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

let config: Promise<SanitizedConfig>;
let payload: Payload;
let address = 0;

/** Уникальная метка запуска: записи прошлых тестов файла не совпадут с записями этого. */
const RUN = Date.now().toString(36);

const post = (route: ReturnType<typeof createSurveyRoute>, body: unknown, ip = `10.20.0.${++address}`) =>
  route(
    new Request('http://localhost/api/survey', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const newRoute = () => createSurveyRoute({ config, demo: DEMO });

/** Чтение коллекции анкет: нет коллекции — нарушение контракта, а не сбой теста. */
const surveysWith = async (comment: string) => {
  const result = payload.find({
    collection: COLLECTION as never,
    where: { comment: { equals: comment } } as never,
    limit: 0,
    depth: 0,
  });

  await expect(result, `коллекция ${COLLECTION} читается`).resolves.toMatchObject({ docs: expect.any(Array) });

  return (await result).docs as unknown as SurveyDoc[];
};

const surveyCount = async () => {
  const result = payload.count({ collection: COLLECTION as never });

  await expect(result, `коллекция ${COLLECTION} читается`).resolves.toMatchObject({ totalDocs: expect.any(Number) });

  return (await result).totalDocs;
};

const expectResponse = async (response: Response, status: number, body: object) => {
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual(body);
};

/**
 * У шаблона и «Клиники» разные схемы, а база интеграционных тестов одна: файл начинает и заканчивает на пустой схеме.
 * Payload — с ключом по умолчанию: тот же экземпляр возьмет обработчик анкеты; засев врачей и услуг — в onInit.
 */
beforeAll(async () => {
  ({ default: config } = await importDental<{ default: Promise<SanitizedConfig> }>('payload.config.ts'));

  await resetTestDatabase();
  payload = await getPayload({ config });
});

afterAll(async () => {
  await payload?.destroy();
  await resetTestDatabase();
});

describe('анкета оценки качества — обработчик и коллекция', () => {
  it('A1: верная анкета — 200 и одна запись с оценками и пометкой демо', async () => {
    const comment = `A1 ${RUN}`;

    await expectResponse(await post(newRoute(), { ...RATINGS, comment }), 200, { ok: true });

    const docs = await surveysWith(comment);

    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ ...RATINGS, comment, demo: 'dental' });
  });

  it('A2: без оценки вежливости — 422 по оценкам, записей не прибавилось', async () => {
    const before = await surveyCount();
    const { courtesy, ...rest } = RATINGS;

    void courtesy;
    await expectResponse(await post(newRoute(), { ...rest, comment: `A2 ${RUN}` }), 422, {
      ok: false,
      reason: 'ratings',
    });
    expect(await surveyCount()).toBe(before);
  });

  it('A2a: без оценки доступности — 200, запись без этой оценки', async () => {
    const comment = `A2a ${RUN}`;
    const { accessibility, ...rest } = RATINGS;

    void accessibility;
    await expectResponse(await post(newRoute(), { ...rest, comment }), 200, { ok: true });

    const docs = await surveysWith(comment);

    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ ...rest, demo: 'dental' });
    expect(docs[0]?.accessibility ?? null).toBeNull();
  });

  it('A3: оценка 6 — 422, записи нет', async () => {
    const comment = `A3 ${RUN}`;

    await expectResponse(await post(newRoute(), { ...RATINGS, comfort: 6, comment }), 422, {
      ok: false,
      reason: 'ratings',
    });
    expect(await surveysWith(comment)).toEqual([]);
  });

  it('A4: заполненная приманка — боту «ок», записи нет', async () => {
    const comment = `A4 ${RUN}`;

    await expectResponse(await post(newRoute(), { ...RATINGS, comment, [HONEYPOT_FIELD]: 'x' }), 200, { ok: true });
    expect(await surveysWith(comment)).toEqual([]);
  });

  it('A5: с одного адреса больше десяти анкет за десять минут не принимается', async () => {
    const route = newRoute();
    const comment = `A5 203.0.113.9 ${RUN}`;
    const responses: Response[] = [];

    for (let index = 0; index < 11; index += 1) {
      responses.push(await post(route, { ...RATINGS, comment }, '203.0.113.9'));
    }

    expect(responses.slice(0, 10).map(({ status }) => status)).toEqual(Array(10).fill(200));
    await expectResponse(responses[10] as Response, 429, { ok: false, reason: 'rate' });
    expect(await surveysWith(comment)).toHaveLength(10);
  });

  it('A6: тело не JSON — 422 по оценкам, а не 500', async () => {
    await expectResponse(await post(newRoute(), 'не json'), 422, { ok: false, reason: 'ratings' });
  });

  it('A7: в схеме анкеты только оценки, комментарий и демо — полей имени и контакта нет', () => {
    const collection = payload.collections[COLLECTION as never] as
      { config: { fields: ({ name?: string } & object)[] } } | undefined;

    expect(collection, `коллекция ${COLLECTION}`).toBeDefined();

    const names = (collection?.config.fields ?? [])
      .flatMap((field) => ('name' in field && typeof field.name === 'string' ? [field.name] : []))
      .filter((name) => !['id', 'createdAt', 'updatedAt'].includes(name));

    expect([...names].sort()).toEqual([...FIELDS].sort());
    expect(names.filter((name) => /name|contact|phone|email|telegram/i.test(name))).toEqual([]);
  });

  it('A8: анкету не создать в обход обработчика и не прочитать без входа', async () => {
    expect(payload.collections[COLLECTION as never], `коллекция ${COLLECTION}`).toBeDefined();

    await expect(
      payload.create({
        collection: COLLECTION as never,
        data: { ...RATINGS, comment: `A8 ${RUN}`, demo: 'dental' } as never,
        overrideAccess: false,
      }),
    ).rejects.toBeInstanceOf(Forbidden);
    await expect(payload.find({ collection: COLLECTION as never, overrideAccess: false })).rejects.toBeInstanceOf(
      Forbidden,
    );
  });
});

describe('поиск по сайту «Клиники» — searchClinic(payload, query)', () => {
  /** Поиск через проверяемую функцию: отклоненный промис вместо списка — нарушение контракта, а не сбой теста. */
  const search = async (query: string) => {
    const { searchClinic } = await importDental<SearchModule>('cms/search.ts');

    expect(searchClinic, 'searchClinic из cms/search.ts').toBeTypeOf('function');

    const result = searchClinic(payload, query);

    await expect(result, `поиск «${query.slice(0, 20)}» отдает список`).resolves.toBeInstanceOf(Array);

    return result;
  };

  it('Q1: врач по фамилии', async () => {
    expect(await search('Лисицына')).toContainEqual(
      expect.objectContaining({ kind: 'Врач', href: '/doctors/lisitsyna', title: 'Лисицына Вера Андреевна' }),
    );
  });

  it('Q2: услуга по названию', async () => {
    expect(await search('Имплантация')).toContainEqual(
      expect.objectContaining({ kind: 'Услуга', href: '/services/implants', title: 'Имплантация' }),
    );
  });

  it('Q3: страница сведений по слову «лицензия»', async () => {
    /** Вид — подпись результата из «Текстов»; неразрывный пробел типографа сравнивается как обычный. */
    const results = (await search('лицензия')).map((result) => ({ ...result, kind: result.kind.replace(/ /g, ' ') }));

    expect(results).toContainEqual(expect.objectContaining({ kind: 'Сведения о клинике', href: '/info' }));
  });

  it('Q4: регистр не важен', async () => {
    expect(await search('лисицына')).toContainEqual(
      expect.objectContaining({ kind: 'Врач', href: '/doctors/lisitsyna', title: 'Лисицына Вера Андреевна' }),
    );
  });

  it.each([[''], ['   ']])('Q5: пустой запрос «%s» — пустой список', async (query) => {
    expect(await search(query)).toEqual([]);
  });

  it('Q6: запрос, которого нет на сайте, — пустой список', async () => {
    expect(await search('Абракадабра')).toEqual([]);
  });

  it('Q7: символы шаблона % и _ — буквальные, не находят все подряд', async () => {
    expect(await search('%')).toEqual([]);
    expect(await search('_')).toEqual([]);
  });

  it('Q8: запрос в 1000 знаков — список без исключения', async () => {
    const query = 'Лисицына'.repeat(125);

    expect(query).toHaveLength(1000);
    expect(Array.isArray(await search(query))).toBe(true);
  });

  const lisitsyna = expect.objectContaining({ kind: 'Врач', href: '/doctors/lisitsyna' });

  it('Q9: слова после 100-го знака не учитываются', async () => {
    const query = `${'Лисицына '.repeat(12)}Абракадабра`;

    expect(query.indexOf('Абракадабра')).toBeGreaterThan(100);
    expect(await search(query)).toContainEqual(lisitsyna);
  });

  it.each([['Лисицына\tВера'], ['Лисицына\nВера'], ['Лисицына   Вера']])(
    'Q10: пробельные символы между словами — разделитель (%j)',
    async (query) => {
      expect(await search(query)).toContainEqual(lisitsyna);
    },
  );

  it('Q11: каждое слово запроса должно встретиться', async () => {
    expect(await search('Лисицына Абракадабра')).toEqual([]);
    expect(await search('лицензия Абракадабра')).toEqual([]);
    expect(await search('Лисицына Вера')).toContainEqual(lisitsyna);
  });

  it('Q12: врач по должности', async () => {
    const orthodontist = DOCTORS.find(({ position }) => position === 'Ортодонт');

    expect(orthodontist, 'ортодонт в засеве').toBeDefined();
    expect(await search('Ортодонт')).toContainEqual(
      expect.objectContaining({ kind: 'Врач', href: `/doctors/${orthodontist?.slug}` }),
    );
  });
});
