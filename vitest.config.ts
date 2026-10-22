import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const APPS_DIR = fileURLToPath(new URL('./apps/', import.meta.url));

/** `@/` — как в tsconfig каждого демо: `src` того приложения, из которого импорт; страницы демо отрисовываются в unit. */
const appSrcAlias = (): Plugin => ({
  name: 'app-src-alias',
  enforce: 'pre',
  resolveId(source, importer, options) {
    if (!source.startsWith('@/') || !importer?.startsWith(APPS_DIR)) {
      return null;
    }

    const app = importer.slice(APPS_DIR.length).split('/')[0];

    return this.resolve(path.join(APPS_DIR, app, 'src', source.slice(2)), importer, { ...options, skipSelf: true });
  },
});

export default defineConfig({
  plugins: [appSrcAlias()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environmentOptions: {
      // виджет отзывов — iframe на yandex.ru: разбор разметки в тесте не должен ходить в сеть
      happyDOM: { settings: { disableIframePageLoading: true } },
    },
  },
});
