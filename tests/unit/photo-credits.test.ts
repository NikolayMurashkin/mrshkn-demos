import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

const CREDITS_FILE = path.join(REPO_ROOT, 'docs/photo-credits.md');

/** Демо с кадрами людей и еды; папки приложения еще может не быть — тогда кадров в нем нет. */
const PHOTO_APPS = ['dental', 'expert', 'coffee', 'event', 'salon'];

const HEADER = '| Файл | Кадр | Автор | Лицензия | Приложение | Место |';

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif)$/i;

/** Страница кадра на стоке: по ней кадр находят и снимают при жалобе. */
const PHOTO_PAGE = [
  /^https:\/\/(www\.)?unsplash\.com\/photos\/[^\s/]\S*$/,
  /^https:\/\/(www\.)?pexels\.com\/photo\/[^\s/]\S*$/,
];

/** Файлы кадров — пути от корня `demos` через `/`. */
const photoFiles = () =>
  PHOTO_APPS.flatMap((app) => {
    const directory = path.join(REPO_ROOT, 'apps', app, 'src/assets/photos');

    return existsSync(directory)
      ? (readdirSync(directory, { recursive: true }) as string[])
          .filter((file) => IMAGE_EXTENSION.test(file))
          .map((file) => path.posix.join('apps', app, 'src/assets/photos', file.split(path.sep).join('/')))
      : [];
  }).sort();

const cellsOf = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

const unquote = (cell: string) => cell.replace(/^`(.*)`$/, '$1').trim();

/**
 * Проблемы реестра кадров: каждая строка называет файл. Таблица — первая с заголовком `HEADER`, строки — до первой
 * строки не таблицы.
 */
const creditProblems = (markdown: string, files: string[]) => {
  const lines = markdown.split('\n').map((line) => line.trim());
  const start = lines.indexOf(HEADER);

  if (start === -1) {
    return [`нет таблицы с заголовком «${HEADER}»`];
  }

  const rows: string[][] = [];

  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith('|')) {
      break;
    }

    rows.push(cellsOf(line));
  }

  const problems: string[] = [];
  const seen = new Set<string>();

  for (const cells of rows) {
    const [rawFile = '', page = '', author = '', license = '', app = '', place = ''] = cells;
    const file = unquote(rawFile);

    if (cells.length !== 6) {
      problems.push(`${file}: в строке ${cells.length} ячеек вместо 6`);
    }

    if (seen.has(file)) {
      problems.push(`${file}: файл повторяется в реестре`);
    }

    seen.add(file);

    if (!files.includes(file)) {
      problems.push(`${file}: строка реестра без файла кадра`);
    }

    if (!PHOTO_PAGE.some((pattern) => pattern.test(page))) {
      problems.push(`${file}: «${page}» — не страница кадра unsplash.com/photos или pexels.com/photo`);
    }

    if (author === '') {
      problems.push(`${file}: пустой автор`);
    }

    if (license === '') {
      problems.push(`${file}: пустая лицензия`);
    }

    if (place === '') {
      problems.push(`${file}: пустое место`);
    }

    const folder = /^apps\/([^/]+)\//.exec(file)?.[1];

    if (app !== folder) {
      problems.push(`${file}: приложение «${app}», а файл в apps/${folder ?? '?'}`);
    }
  }

  for (const file of files) {
    if (!seen.has(file)) {
      problems.push(`${file}: файл кадра без строки в реестре`);
    }
  }

  return problems;
};

const table = (rows: string[]) =>
  ['Реестр.', '', HEADER, '| --- | --- | --- | --- | --- | --- |', ...rows, '', 'Конец.'].join('\n');

describe('реестр фото в демо', () => {
  it('C0: проверка реестра ловит чужой адрес, пустого автора, строку без файла и файл без строки', () => {
    const valid = 'apps/dental/src/assets/photos/valid.jpg';
    const foreign = 'apps/dental/src/assets/photos/foreign.jpg';
    const anonymous = 'apps/coffee/src/assets/photos/anonymous.webp';
    const missing = 'apps/expert/src/assets/photos/missing.jpg';
    const uncredited = 'apps/coffee/src/assets/photos/uncredited.avif';
    const validRow = `| \`${valid}\` | https://unsplash.com/photos/abc | Анна Автор | Unsplash License | dental | Врачи, карточка |`;
    const markdown = table([
      validRow,
      `| \`${foreign}\` | https://google.com/x | Борис Автор | Unsplash License | dental | Врачи, карточка |`,
      `| \`${anonymous}\` | https://www.pexels.com/photo/latte-123 |  | Pexels License | coffee | Меню, латте |`,
      `| \`${missing}\` | https://pexels.com/photo/room-456 | Вера Автор | Pexels License | expert | Статья, обложка |`,
    ]);
    const problems = creditProblems(markdown, [valid, foreign, anonymous, uncredited]);

    expect(problems, problems.join('\n')).toHaveLength(4);

    for (const file of [foreign, anonymous, missing, uncredited]) {
      expect(
        problems.filter((problem) => problem.includes(file)),
        `одна проблема называет ${file}`,
      ).toHaveLength(1);
    }

    expect(problems.filter((problem) => problem.includes(valid))).toEqual([]);
    expect(creditProblems(table([validRow]), [valid])).toEqual([]);
  });

  it('C1: docs/photo-credits.md есть, в нем таблица с заголовком реестра', () => {
    expect(existsSync(CREDITS_FILE), 'нет docs/photo-credits.md').toBe(true);

    const lines = existsSync(CREDITS_FILE)
      ? readFileSync(CREDITS_FILE, 'utf8')
          .split('\n')
          .map((line) => line.trim())
      : [];

    expect(lines).toContain(HEADER);
  });

  it('C2: у каждого файла кадра есть строка реестра, у каждой строки — файл, страница кадра, автор, лицензия, место', () => {
    expect(existsSync(CREDITS_FILE), 'нет docs/photo-credits.md').toBe(true);

    const markdown = existsSync(CREDITS_FILE) ? readFileSync(CREDITS_FILE, 'utf8') : '';
    const problems = creditProblems(markdown, photoFiles());

    expect(problems, problems.join('\n')).toEqual([]);
  });
});
