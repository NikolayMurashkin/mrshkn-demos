const app = process.env.LIGHTHOUSE_APP ?? 'template';

module.exports = {
  ci: {
    collect: {
      startServerCommand: `DEMO_ENV=production NEXT_DIST_DIR=.next-production yarn workspace @mrshkn/demo-${app} start -p 3302`,
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 120000,
      url: ['http://localhost:3302/', 'http://localhost:3302/privacy'],
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
