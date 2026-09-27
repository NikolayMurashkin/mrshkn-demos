import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '**/.next/**',
      '**/.next-*/**',
      '**/node_modules/**',
      '**/.lighthouseci/**',
      'playwright-report/**',
      'test-results/**',
      'apps/*/src/app/(payload)/**',
      'apps/*/src/payload-types.ts',
      'apps/*/src/migrations/**',
      'apps/*/next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    settings: {
      next: { rootDir: ['apps/*/'] },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  {
    // конфиг Lighthouse CI грузится через require и сам остается CommonJS
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default config;
