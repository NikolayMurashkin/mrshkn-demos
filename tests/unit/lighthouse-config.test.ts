import { createRequire } from 'node:module';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DOCTORS, SERVICES } from '../../apps/dental/src/cms/seed/data';

type LighthouseConfig = {
  ci: {
    collect: { url: string[]; numberOfRuns: number };
    assert: { aggregationMethod: string; assertions: Record<string, [string, { minScore: number }]> };
  };
};

const CONFIG = path.resolve(import.meta.dirname, '../../lighthouserc.cjs');

const require = createRequire(import.meta.url);

const loadConfig = (app?: string): LighthouseConfig => {
  if (app) {
    process.env.LIGHTHOUSE_APP = app;
  } else {
    delete process.env.LIGHTHOUSE_APP;
  }

  delete require.cache[CONFIG];

  return require(CONFIG);
};

const pathsOf = (config: LighthouseConfig) => config.ci.collect.url.map((url) => new URL(url).pathname);

afterEach(() => {
  delete process.env.LIGHTHOUSE_APP;
});

describe('Lighthouse CI', () => {
  it('каждая категория ≥ 0,9 в каждом из трех прогонов', () => {
    const { collect, assert } = loadConfig('dental').ci;

    expect(collect.numberOfRuns).toBe(3);
    expect(assert.aggregationMethod).toBe('pessimistic');

    for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const [level, { minScore }] = assert.assertions[`categories:${category}`];

      expect(level, category).toBe('error');
      expect(minScore, category).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('демо «Клиника» меряется на главной, странице врача и странице услуги из засева', () => {
    const paths = pathsOf(loadConfig('dental'));
    const doctor = paths.find((pathname) => pathname.startsWith('/doctors/'));
    const service = paths.find((pathname) => pathname.startsWith('/services/'));

    expect(paths).toContain('/');
    expect(DOCTORS.map(({ slug }) => `/doctors/${slug}`)).toContain(doctor);
    expect(SERVICES.map(({ slug }) => `/services/${slug}`)).toContain(service);
  });

  it('шаблон и развернутые из него демо без своих страниц меряются на главной и политике', () => {
    expect(pathsOf(loadConfig())).toEqual(['/', '/privacy']);
    expect(pathsOf(loadConfig('ci-probe'))).toEqual(['/', '/privacy']);
  });

  it('демо «Клиника»: accessibility каждого прогона равна 100, performance не ниже 90', () => {
    const { collect, assert } = loadConfig('dental').ci;
    const [performanceLevel, { minScore: performanceMinScore }] = assert.assertions['categories:performance'];

    expect(collect.numberOfRuns).toBe(3);
    expect(assert.aggregationMethod).toBe('pessimistic');
    expect(assert.assertions['categories:accessibility']).toEqual(['error', { minScore: 1 }]);
    expect(performanceLevel).toBe('error');
    expect(performanceMinScore).toBeGreaterThanOrEqual(0.9);
  });

  it('демо «Автосервис» меряется на /ru и /en: три прогона, каждая категория ≥ 0,9', () => {
    const config = loadConfig('auto');
    const { collect, assert } = config.ci;

    expect(pathsOf(config)).toEqual(['/ru', '/en']);
    expect(collect.numberOfRuns).toBe(3);
    expect(assert.aggregationMethod).toBe('pessimistic');

    for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const [level, { minScore }] = assert.assertions[`categories:${category}`];

      expect(level, category).toBe('error');
      expect(minScore, category).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('шаблон и развернутые из него демо: порог accessibility прежний — 90', () => {
    expect(loadConfig().ci.assert.assertions['categories:accessibility']).toEqual(['error', { minScore: 0.9 }]);
    expect(loadConfig('ci-probe').ci.assert.assertions['categories:accessibility']).toEqual([
      'error',
      { minScore: 0.9 },
    ]);
  });
});
