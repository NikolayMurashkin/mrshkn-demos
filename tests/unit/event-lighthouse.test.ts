import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

type LighthouseConfig = {
  ci: {
    collect: { url: string[]; numberOfRuns: number };
    assert: { aggregationMethod: string; assertions: Record<string, [string, { minScore: number }]> };
  };
};

const ROOT = path.resolve(import.meta.dirname, '../..');
const CONFIG = path.join(ROOT, 'lighthouserc.cjs');
const APP_FILE = path.join(ROOT, 'apps/event/lighthouse.json');
const CI_FILE = path.join(ROOT, '.github/workflows/ci.yml');

const require = createRequire(import.meta.url);

const loadConfig = (app: string): LighthouseConfig => {
  process.env.LIGHTHOUSE_APP = app;
  delete require.cache[CONFIG];

  return require(CONFIG);
};

const pagesOf = (config: LighthouseConfig) =>
  config.ci.collect.url.map((url) => {
    const { pathname, search } = new URL(url);

    return `${pathname}${search}`;
  });

/** Матрица `app` джобы `lighthouse` в ci.yml: строка `app: [a, b, c]` внутри блока джобы. */
const lighthouseMatrix = () => {
  const lines = readFileSync(CI_FILE, 'utf8').split('\n');
  const start = lines.indexOf('  lighthouse:');
  const end = lines.findIndex((line, index) => index > start && /^ {2}[\w-]+:\s*$/.test(line));
  const job = lines.slice(start, end === -1 ? undefined : end);
  const appLine = job.find((line) => /^\s+app:\s*\[/.test(line));

  expect(start, 'джоба lighthouse в ci.yml').toBeGreaterThanOrEqual(0);
  expect(appLine, 'матрица app джобы lighthouse').toBeDefined();

  return (appLine ?? '')
    .replace(/^\s+app:\s*\[/, '')
    .replace(/\].*$/, '')
    .split(',')
    .map((app) => app.trim());
};

afterEach(() => {
  delete process.env.LIGHTHOUSE_APP;
});

describe('Lighthouse CI демо «Концерт»', () => {
  it('L1: страницы замера — /ru и /en; три прогона, pessimistic; accessibility 1, остальные категории ≥ 0,9', () => {
    expect(existsSync(APP_FILE), 'нет apps/event/lighthouse.json').toBe(true);

    const config = loadConfig('event');
    const { collect, assert } = config.ci;

    expect([...pagesOf(config)].sort()).toEqual(['/en', '/ru']);
    expect(collect.numberOfRuns).toBe(3);
    expect(assert.aggregationMethod).toBe('pessimistic');
    expect(assert.assertions['categories:accessibility']).toEqual(['error', { minScore: 1 }]);

    for (const category of ['performance', 'best-practices', 'seo']) {
      const [level, { minScore }] = assert.assertions[`categories:${category}`];

      expect(level, category).toBe('error');
      expect(minScore, category).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('L2: демо «Концерт» в матрице Lighthouse CI, «SaaS-лендинг» пока в ней остается', () => {
    const matrix = lighthouseMatrix();

    expect(matrix).toContain('event');
    expect(matrix).toContain('launch');
  });
});
