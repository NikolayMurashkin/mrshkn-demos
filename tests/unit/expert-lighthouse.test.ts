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

afterEach(() => {
  delete process.env.LIGHTHOUSE_APP;
});

describe('Lighthouse CI демо «Эксперт»', () => {
  it('L1: страницы замера: прежние и /articles', () => {
    expect([...pagesOf(loadConfig('expert'))].sort()).toEqual(
      ['/', '/formats', '/articles', '/articles/night-anxiety', '/quiz', '/booking'].sort(),
    );
  });

  it('L2: accessibility 100 в каждом прогоне, performance ≥ 90', () => {
    const { assert } = loadConfig('expert').ci;

    expect(assert.aggregationMethod).toBe('pessimistic');
    expect(assert.assertions['categories:accessibility']).toEqual(['error', { minScore: 1 }]);

    const [level, { minScore }] = assert.assertions['categories:performance'];

    expect(level).toBe('error');
    expect(minScore).toBeGreaterThanOrEqual(0.9);
  });
});
