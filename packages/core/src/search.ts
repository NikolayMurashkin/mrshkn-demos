import type { Payload, Where } from 'payload';
import { SEARCH_QUERY_MAX_LENGTH } from './consts';
import type { SearchResult, SearchSources } from './types';

export type { SearchCollection, SearchPage, SearchResult, SearchSources } from './types';

/** Запрос как его ищет сайт: края обрезаны, пробелы схлопнуты, не длиннее предела. */
export const normalizeQuery = (query: string) =>
  query.trim().replace(/\s+/g, ' ').slice(0, SEARCH_QUERY_MAX_LENGTH).trim();

/**
 * `%` и `_` посетителя — буквальные символы, а не шаблон LIKE: иначе «%» нашел бы все подряд. Обратная косая —
 * символ экранирования LIKE в Postgres по умолчанию.
 */
const escapeLike = (word: string) => word.replace(/[\\%_]/g, (symbol) => `\\${symbol}`);

const textOf = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * Поиск по сайту: документы коллекций через Local API, страницы из кода — по их тексту. Каждое слово запроса
 * должно встретиться (без учета регистра) хотя бы в одном поле; порядок — как в `sources`.
 */
export const searchSite = async (
  payload: Payload,
  query: string,
  { collections, pages }: SearchSources,
): Promise<SearchResult[]> => {
  const normalized = normalizeQuery(query);

  if (!normalized) {
    return [];
  }

  const words = normalized.split(' ');
  const found: SearchResult[] = [];

  for (const { slug, fields, title, href, kind, sort } of collections) {
    const where: Where = {
      and: words.map((word) => ({ or: fields.map((field) => ({ [field]: { like: escapeLike(word) } })) })),
    };
    const { docs } = await payload.find({
      collection: slug as never,
      where,
      sort,
      limit: 0,
      depth: 0,
      pagination: false,
    });

    for (const doc of docs as unknown as Record<string, unknown>[]) {
      found.push({ kind, title: textOf(doc[title]), href: href(doc) });
    }
  }

  const lowered = words.map((word) => word.toLocaleLowerCase('ru'));

  for (const { title, href, text, kind } of pages) {
    const haystack = `${title} ${text}`.toLocaleLowerCase('ru');

    if (lowered.every((word) => haystack.includes(word))) {
      found.push({ kind, title, href });
    }
  }

  return found;
};
