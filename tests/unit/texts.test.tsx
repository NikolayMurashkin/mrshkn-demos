/** @vitest-environment happy-dom */
import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import { CORE_TEXTS } from '@mrshkn/demo-core/texts';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const CYRILLIC = /[А-Яа-яЁё]/;

const EN_POLICY_HREF = '/en/privacy';

/** Тексты страницы «Автосервиса»: путь переменной, чтобы до демо `auto` падала только его проверка, а не весь файл. */
const AUTO_TEXTS = path.resolve(import.meta.dirname, '../../apps/auto/src/texts.ts');

const parse = (markup: string) => new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;

/** Листья словаря: путь ключа через точку и значение. */
const leaves = (value: unknown, prefix = ''): [string, unknown][] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, item]) => leaves(item, prefix ? `${prefix}.${key}` : key))
    : [[prefix, value]];

const keysOf = (texts: unknown) =>
  leaves(texts)
    .map(([key]) => key)
    .sort();

const strings = (texts: unknown) =>
  leaves(texts).filter((leaf): leaf is [string, string] => typeof leaf[1] === 'string');

const expectBilingual = (texts: Record<'ru' | 'en', unknown>) => {
  const ruKeys = keysOf(texts.ru);

  expect(ruKeys.length).toBeGreaterThan(0);
  expect(keysOf(texts.en)).toEqual(ruKeys);

  for (const lang of ['ru', 'en'] as const) {
    for (const [key, text] of strings(texts[lang])) {
      expect(text.trim(), `${lang}.${key}`).not.toBe('');
    }
  }

  for (const [key, text] of strings(texts.en)) {
    expect(text, `en.${key}`).not.toMatch(CYRILLIC);
  }
};

describe('тексты на ru и en', () => {
  it('у текстов ядра ключи ru и en совпадают, en написан по-английски', () => {
    expectBilingual(CORE_TEXTS);
  });

  it('у текстов демо «Автосервис» ключи ru и en совпадают, en написан по-английски', async () => {
    expect(existsSync(AUTO_TEXTS), 'нет apps/auto/src/texts.ts').toBe(true);

    const { TEXTS } = (await import(/* @vite-ignore */ AUTO_TEXTS)) as { TEXTS: Record<'ru' | 'en', unknown> };

    expectBilingual(TEXTS);
  });

  it.each<[string, () => ReactElement]>([
    [
      'DemoFooter',
      () => (
        <DemoFooter
          lang="en"
          policyHref={EN_POLICY_HREF}
        />
      ),
    ],
    [
      'LeadForm',
      () => (
        <LeadForm
          lang="en"
          policyHref={EN_POLICY_HREF}
        />
      ),
    ],
    [
      'CookieBanner',
      () => (
        <CookieBanner
          lang="en"
          initiallyVisible
          policyHref={EN_POLICY_HREF}
        />
      ),
    ],
    [
      'MapEmbed',
      () => (
        <MapEmbed
          lang="en"
          point={{ latitude: 55.75, longitude: 37.62 }}
          label="Phase Garage"
        />
      ),
    ],
    [
      'PrivacyPolicy',
      () => (
        <PrivacyPolicy
          lang="en"
          withYandexReviews={false}
          withYandexMap
        />
      ),
    ],
  ])('%s на en — без кириллицы', (_, render) => {
    const markup = renderToStaticMarkup(render());

    expect(markup).not.toBe('');
    expect(markup).not.toMatch(CYRILLIC);
  });

  it('подвал на en подписан студией и ведет на mrshkn.com и английскую политику', () => {
    const footer = parse(
      renderToStaticMarkup(
        <DemoFooter
          lang="en"
          policyHref={EN_POLICY_HREF}
        />,
      ),
    );

    expect(footer.querySelector('a[href="https://mrshkn.com"]')).not.toBeNull();
    expect(footer.textContent).toContain('MRSHKN');
    expect(footer.querySelector(`a[href="${EN_POLICY_HREF}"]`)).not.toBeNull();
  });
});
