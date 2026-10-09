const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const app = process.env.LIGHTHOUSE_APP ?? 'template';

/**
 * Демо со своими страницами перечисляет их в `apps/<демо>/lighthouse.json`; шаблон и развернутые из него — главная
 * и политика. Там же демо поднимает порог категории (`minScores`): шаблон его не задает, и развернутые демо
 * получают общие 0,9.
 */
const appFile = path.join(__dirname, 'apps', app, 'lighthouse.json');
const appConfig = existsSync(appFile) ? JSON.parse(readFileSync(appFile, 'utf8')) : {};
const paths = appConfig.paths ?? ['/', '/privacy'];

const minScore = (category) => appConfig.minScores?.[category] ?? 0.9;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `DEMO_ENV=production NEXT_DIST_DIR=.next-production yarn workspace @mrshkn/demo-${app} start -p 3302`,
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 120000,
      url: paths.map((pathname) => `http://localhost:3302${pathname}`),
      numberOfRuns: 3,
    },
    assert: {
      aggregationMethod: 'pessimistic',
      assertions: {
        'categories:performance': ['error', { minScore: minScore('performance') }],
        'categories:accessibility': ['error', { minScore: minScore('accessibility') }],
        'categories:best-practices': ['error', { minScore: minScore('best-practices') }],
        'categories:seo': ['error', { minScore: minScore('seo') }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `.lighthouseci/${app}`,
    },
  },
};
