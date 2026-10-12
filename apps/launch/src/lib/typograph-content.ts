import { typograph } from '@mrshkn/demo-core/typograph';

/** Поля, которые типограф не трогает: адреса, команды и код копируют руками, неразрывный пробел в них лишний. */
const RAW_KEYS = new Set(['href', 'section', 'command', 'code', 'prompt', 'id', 'slug', 'date', 'version', 'wordmark']);

/** Тексты контента — через типограф ядра: неразрывный пробел после коротких слов и перед тире. */
export const typographContent = <T>(value: T, key = ''): T => {
  if (typeof value === 'string') {
    return (RAW_KEYS.has(key) ? value : typograph(value)) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => typographContent(item, key)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entry]) => [entryKey, typographContent(entry, entryKey)]),
    ) as T;
  }

  return value;
};
