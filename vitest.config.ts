import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environmentOptions: {
      // виджет отзывов — iframe на yandex.ru: разбор разметки в тесте не должен ходить в сеть
      happyDOM: { settings: { disableIframePageLoading: true } },
    },
  },
});
