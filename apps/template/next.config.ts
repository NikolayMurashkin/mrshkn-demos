import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Корень монорепозитория: общий пакет лежит вне приложения, и сборка, и трассировка standalone идут от него. */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // образ стенда запускает `node apps/<демо>/server.js` из `.next/standalone` без полного node_modules
  output: 'standalone',
  outputFileTracingRoot: root,
  turbopack: { root },
  transpilePackages: ['@mrshkn/demo-core'],
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
};

const payloadConfig = withPayload(nextConfig, { devBundleServerPackages: false });

/**
 * Подсказки темы (Accept-CH, Critical-CH) нужны только админке Payload, а withPayload вешает их на все адреса:
 * на странице демо Critical-CH заставляет Chrome повторить первый запрос с подсказкой.
 */
const config: NextConfig = {
  ...payloadConfig,
  headers: async () =>
    ((await payloadConfig.headers?.()) ?? []).map((rule) =>
      rule.headers.some((header) => header.key === 'Critical-CH') ? { ...rule, source: '/admin/:path*' } : rule,
    ),
};

export default config;
