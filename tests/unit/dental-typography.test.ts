import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { SHORT_WORDS } from '@mrshkn/demo-core/consts';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

/**
 * Где тексты не проверяются: сгенерированное Payload, контент засева (его типографирует отрисовка через `typograph`)
 * и подписи полей админки — на сайт они не выходят.
 */
const SKIPPED = ['payload-types.ts', 'migrations', '(payload)', 'seed', 'collections'];

/**
 * Короткое слово, за которым обычный пробел, а не неразрывный: «в плане», «и зачем». В тексте JSX пробелом
 * становится и перенос строки после слова, и `{' '}`.
 */
const LOOSE_SHORT_WORD = new RegExp(`(?<![а-яё])(${SHORT_WORDS.join('|')})( (?=\\S)|$|\\{' '\\})`, 'iu');

const LOOSE_DASH = / —/;

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    if (SKIPPED.includes(entry.name)) {
      return [];
    }

    if (entry.isDirectory()) {
      return sourceFiles(full);
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

/** Строки с русским текстом вне комментариев: литералы и текст JSX. */
const textLines = (file: string) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => /[а-яё]/i.test(line) && !/^(\/\/|\/\*|\*)/.test(line));

describe('демо «Клиника»: тексты страниц', () => {
  it('после коротких слов и перед тире — неразрывный пробел', () => {
    const files = sourceFiles(SRC);
    const loose = files.flatMap((file) =>
      textLines(file)
        .filter(({ line }) => LOOSE_SHORT_WORD.test(line) || LOOSE_DASH.test(line))
        .map(({ line, number }) => `${path.relative(SRC, file)}:${number}: ${line}`),
    );

    expect(files.length).toBeGreaterThan(10);
    expect(loose).toEqual([]);
  });
});
