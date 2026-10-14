import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { STAGE_CANVAS, STAGE_MIN_HEIGHT, STAGE_SIDE_COLUMNS, STAGE_STACKED_HEIGHT } from '../../apps/auto/src/consts';
import { coverSizes } from '../../apps/auto/src/lib/poster';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

const WHERE_IT_HURTS_SCSS = path.join(REPO_ROOT, 'apps/auto/src/components/WhereItHurts/WhereItHurts.module.scss');

const TOKENS_SCSS = path.join(REPO_ROOT, 'apps/auto/src/styles/tokens.scss');

/** SCSS без комментариев: блочных и строчных (`//` только с начала строки — в `url(...)` бывает `http://`). */
const readScss = (file: string) =>
  readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/**
 * Правила без вложенных блоков: селектор — текст между предыдущей `{`, `}` или `;` и `{`, тело — до `}`. Правило внутри
 * `@media` тоже попадает: у него нет вложенных блоков.
 */
const innermostRules = (source: string) =>
  [...source.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1].split(',').map((selector) => selector.trim()),
    body: match[2],
  }));

/** Значения свойства в теле правила или файле: `name: value;`, пробелы вокруг двоеточия любые. */
const declarationValues = (source: string, name: string) =>
  [...source.matchAll(new RegExp(`(?:^|[\\s;{])${name}\\s*:\\s*([^;{}]+?)\\s*(?:;|$|\\})`, 'gm'))].map(
    (match) => match[1],
  );

const withoutSpaces = (value: string) => value.replace(/\s+/g, '');

const pxValue = (value: string) => {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());

  expect(match, `ожидалось значение в px, получено «${value}»`).not.toBeNull();

  return Number(match?.[1]);
};

describe('ширина постера для sizes: холст сцены и object-fit: cover', () => {
  it('S-cover-1: холст колонки и холст в колонку дают точные строки sizes для своих файлов', () => {
    expect(coverSizes(STAGE_CANVAS.column, { width: 1360, height: 1800 })).toBe(
      'max(calc(100vw - 760px), calc(0.7556 * max(100svh, 560px)))',
    );
    expect(coverSizes(STAGE_CANVAS.stacked, { width: 1440, height: 900 })).toBe(
      'max(100vw, calc(1.6 * clamp(280px, 52svh, 520px)))',
    );
  });

  it('S-cover-2: пропорция округляется вверх до 4 знаков и пишется без хвостовых нулей', () => {
    expect(coverSizes({ width: 'W', height: 'H' }, { width: 1, height: 3 })).toBe('max(W, calc(0.3334 * H))');
    expect(coverSizes({ width: 'W', height: 'H' }, { width: 2, height: 1 })).toBe('max(W, calc(2 * H))');
  });

  it('S-cover-3: константы холста совпадают со стилями сцены и токеном высоты', () => {
    const whereItHurts = readScss(WHERE_IT_HURTS_SCSS);

    const stageMinHeights = innermostRules(whereItHurts)
      .filter((rule) => rule.selectors.includes('.stage'))
      .flatMap((rule) => declarationValues(rule.body, 'min-height'))
      .filter((value) => /px$/.test(value.trim()));

    expect(stageMinHeights.length, 'у .stage есть правило с min-height в px').toBeGreaterThan(0);

    for (const value of stageMinHeights) {
      expect(pxValue(value), `min-height .stage: ${value}`).toBe(STAGE_MIN_HEIGHT);
    }

    const stageHeights = declarationValues(readScss(TOKENS_SCSS), '--auto-stage-height');

    expect(stageHeights.length, '--auto-stage-height задан в tokens.scss').toBeGreaterThan(0);

    for (const value of stageHeights) {
      expect(withoutSpaces(value), '--auto-stage-height').toBe(
        withoutSpaces(
          `clamp(${STAGE_STACKED_HEIGHT.min}px, ${STAGE_STACKED_HEIGHT.svh}svh, ${STAGE_STACKED_HEIGHT.max}px)`,
        ),
      );
    }

    const [columns] = declarationValues(whereItHurts, 'grid-template-columns');

    expect(columns, 'grid-template-columns сетки задан').toBeDefined();

    const tracks = [...columns.matchAll(/minmax\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)/g)];

    expect(withoutSpaces(columns), 'сетка — ровно три дорожки minmax(…)').toBe(
      tracks.map((track) => withoutSpaces(track[0])).join(''),
    );
    expect(tracks).toHaveLength(3);

    const sideColumns = pxValue(tracks[0][2]) + pxValue(tracks[2][2]);

    expect(sideColumns, `боковые колонки: ${tracks[0][0]} + ${tracks[2][0]}`).toBe(STAGE_SIDE_COLUMNS);
  });
});
