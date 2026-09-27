const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const app = process.env.LIGHTHOUSE_APP ?? 'template';

/** Демо со своими страницами перечисляет их в `apps/<демо>/lighthouse.json`; шаблон и развернутые из него — главная и политика. */
const pathsFile = path.join(__dirname, 'apps', app, 'lighthouse.json');
const paths = existsSync(pathsFile) ? JSON.parse(readFileSync(pathsFile, 'utf8')).paths : ['/', '/privacy'];

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
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `.lighthouseci/${app}`,
    },
  },
};
