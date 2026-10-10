/** @vitest-environment happy-dom */
import { isReviewAuthor, Reviews } from '@mrshkn/demo-core/cms/reviews';
import { DemoReviews } from '@mrshkn/demo-core/components/DemoReviews';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import type { DemoConfig } from '@mrshkn/demo-core/types';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Field, TextFieldSingleValidation } from 'payload';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { REVIEWS } from '../../apps/dental/src/cms/seed/data';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

/** Площадки отзывов, которыми вымышленный отзыв подписываться не может. */
const PLATFORMS = /яндекс|yandex|2\s?гис|2\s?gis|продокторов|prodoctorov|google|гугл/i;

/** Что в блоке отзывов считается картинкой: фото авторов, логотипы площадок, звезды. */
const PICTURES = 'img, picture, svg, canvas, video, iframe, object, embed, [style*="url("]';

/** Типы schema.org, которые выдали бы вымышленные отзывы поиску: без строки с типом их в разметку не положить. */
const REVIEW_MARKUP = /["'](Review|AggregateRating)["']|\baggregateRating\b/;

const APPS = readdirSync(path.join(REPO_ROOT, 'apps')).filter((name) =>
  existsSync(path.join(REPO_ROOT, 'apps', name, 'package.json')),
);

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return ['(payload)', 'migrations'].includes(entry.name) ? [] : sourceFiles(full);
    }

    return /\.(ts|tsx)$/.test(entry.name) && entry.name !== 'payload-types.ts' ? [full] : [];
  });

const schemaTypes = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(schemaTypes);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => [
      ...(key === '@type' ? [String(item)] : []),
      ...(['review', 'reviews', 'aggregateRating'].includes(key) ? [key] : []),
      ...schemaTypes(item),
    ]);
  }

  return [];
};

const renderReviews = () => {
  const document = new DOMParser().parseFromString(
    `<body>${renderToStaticMarkup(
      <DemoReviews
        title="Отзывы"
        reviews={REVIEWS}
      />,
    )}</body>`,
    'text/html',
  );

  return document.body;
};

const authorField = () =>
  Reviews.fields.find((field): field is Extract<Field, { name: string }> => 'name' in field && field.name === 'author');

describe('отзывы в демо вымышленного дела', () => {
  it('в демо «Клиника» есть отзывы для блока', () => {
    expect(REVIEWS.length).toBeGreaterThanOrEqual(3);
  });

  it('блок отзывов показывает каждый отзыв текстом с подписью автора', () => {
    const body = renderReviews();
    const quotes = [...body.querySelectorAll('blockquote')].map((quote) =>
      quote.textContent?.replace(/\u00a0/g, ' ').trim(),
    );

    expect(quotes).toEqual(REVIEWS.map((review) => review.text));
    expect([...body.querySelectorAll('cite')].map((cite) => cite.textContent)).toEqual(
      REVIEWS.map((review) => review.author),
    );
  });

  it('в блоке отзывов нет картинок: ни фото авторов, ни логотипов, ни звезд', () => {
    expect(renderReviews().querySelectorAll(PICTURES)).toHaveLength(0);
  });

  it('в блоке отзывов нет названий площадок отзывов', () => {
    expect(renderReviews().textContent).not.toMatch(PLATFORMS);
  });

  it('автор каждого отзыва — имя и первая буква фамилии', () => {
    for (const { author } of REVIEWS) {
      expect(isReviewAuthor(author), author).toBe(true);
    }
  });

  it.each(['Ирина Смирнова', 'Ирина', 'Ирина С', 'ирина С.', 'Ирина С. К.', 'И. Смирнова', 'Irina S.'])(
    'подпись «%s» — не имя с первой буквой фамилии',
    (author) => {
      expect(isReviewAuthor(author)).toBe(false);
    },
  );

  it('коллекция отзывов в CMS не сохраняет автора с полной фамилией и не принимает картинок', async () => {
    const field = authorField();
    const validate = field && 'validate' in field ? (field.validate as TextFieldSingleValidation) : undefined;

    expect(field?.type).toBe('text');
    expect(await validate?.('Ирина С.', {} as Parameters<TextFieldSingleValidation>[1])).toBe(true);
    expect(await validate?.('Ирина Смирнова', {} as Parameters<TextFieldSingleValidation>[1])).toEqual(
      expect.any(String),
    );
    expect(JSON.stringify(Reviews.fields)).not.toMatch(/"type":"upload"|"relationTo"/);
  });

  it('подпись отзыва проверяется по шаблону своего языка', async () => {
    for (const author of ['Emily R.', 'Mary-Jane K.']) {
      expect(isReviewAuthor(author, 'en'), author).toBe(true);
    }

    for (const author of ['Ирина С.', 'Emily', 'emily r.', 'Emily Ross']) {
      expect(isReviewAuthor(author, 'en'), author).toBe(false);
    }

    expect(isReviewAuthor('Ирина С.', 'ru')).toBe(true);
    expect(isReviewAuthor('Ирина С.')).toBe(true);
    expect(isReviewAuthor('Emily R.', 'ru')).toBe(false);
    expect(isReviewAuthor('Emily R.')).toBe(false);

    const field = authorField();
    const validate = field && 'validate' in field ? (field.validate as TextFieldSingleValidation) : undefined;
    const english = { req: { locale: 'en' } } as unknown as Parameters<TextFieldSingleValidation>[1];
    const noLocale = {} as Parameters<TextFieldSingleValidation>[1];

    expect(await validate?.('Emily R.', english)).toBe(true);
    expect(await validate?.('Ирина С.', english)).toEqual(expect.any(String));
    expect(await validate?.('Ирина С.', noLocale)).toBe(true);
    expect(await validate?.('Emily R.', noLocale)).toEqual(expect.any(String));
  });

  it('JSON-LD страниц собирается из данных демо и не содержит Review и AggregateRating', async () => {
    for (const app of APPS) {
      const { DEMO } = (await import(`../../apps/${app}/src/demo.config.ts`)) as { DEMO: DemoConfig };

      expect(schemaTypes(buildBusinessJsonLd(DEMO)), app).not.toEqual(
        expect.arrayContaining([expect.stringMatching(/^(Review|AggregateRating|review|reviews|aggregateRating)$/)]),
      );
    }
  });

  it('ни одна страница и ни один компонент не пишут Review и AggregateRating в разметку', () => {
    const files = [
      ...APPS.flatMap((app) => sourceFiles(path.join(REPO_ROOT, 'apps', app, 'src'))),
      ...sourceFiles(path.join(REPO_ROOT, 'packages/core/src')),
    ];

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      expect(readFileSync(file, 'utf8'), path.relative(REPO_ROOT, file)).not.toMatch(REVIEW_MARKUP);
    }
  });
});
