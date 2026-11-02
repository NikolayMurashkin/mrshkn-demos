/** @vitest-environment happy-dom */
import { Photo } from '@mrshkn/demo-core/components/Photo';
import { validatePhotoKey } from '@mrshkn/demo-core/photo';
import type { StaticImageData } from 'next/image';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Кадр без импорта файла: тот же объект, что дает статический импорт картинки в Next. */
const IMAGE: StaticImageData = { src: '/_next/static/media/doctor.0a1b2c3d.jpg', width: 1200, height: 1500 };

const ALT = 'Врач у кресла';

/** Адрес оптимизатора Next для кадра: формат (AVIF или WebP) он выбирает сам по заголовку Accept. */
const OPTIMIZER_PREFIX = `/_next/image?url=${encodeURIComponent(IMAGE.src)}`;

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');

const PHOTO_DIR = path.join(CORE_SRC, 'components/Photo');

/** Подпись сравнивается с обычными пробелами: типограф может поставить неразрывные. */
const plain = (text: string | null | undefined) => (text ?? '').replace(/ /g, ' ').trim();

let root: Root | null = null;

let container: HTMLDivElement;

const mount = async (node: ReactNode) => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(node);
  });
};

const pictures = () => [...container.querySelectorAll('picture')];

/** Единственный `img` единственного `picture`: иначе assert, а не падение на `undefined`. */
const photoImage = () => {
  const found = pictures();

  expect(found, 'ровно один <picture>').toHaveLength(1);

  const images = [...(found[0]?.querySelectorAll('img') ?? [])];

  expect(images, 'ровно один <img> в <picture>').toHaveLength(1);

  return images[0] as HTMLImageElement;
};

/** SCSS без комментариев: блочных и строчных (`//` только с начала строки — в `url(...)` бывает `http://`). */
const readScss = (file: string) =>
  readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const scssFiles = (directory: string) =>
  existsSync(directory)
    ? (readdirSync(directory, { recursive: true }) as string[])
        .filter((file) => file.endsWith('.scss'))
        .map((file) => path.join(directory, file))
    : [];

/**
 * Селекторы из `:is(…)` правил режима «без картинок», которые прячут элемент (`display: none`). Список — из SCSS ядра:
 * тест не знает заранее, каким селектором реализация пометит кадр.
 */
const hiddenWhenImagesOff = () =>
  scssFiles(CORE_SRC).flatMap((file) =>
    [...readScss(file).matchAll(/html\[data-lv-images=(['"])off\1\]\s*:is\(([^)]*)\)\s*\{([^{}]*)\}/g)]
      .filter((match) => /(?:^|[\s;])display\s*:\s*none\s*(?:;|$)/.test(match[3]))
      .flatMap((match) => match[2].split(',').map((selector) => selector.trim()))
      .filter(Boolean),
  );

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  root = null;
  document.body.innerHTML = '';
});

/**
 * Пропсы кадра — контракт типов: `alt` и `sizes` обязательны. Функция не вызывается, ее проверяет `tsc --noEmit`:
 * станет пропс необязательным — `@ts-expect-error` без ошибки уронит проверку типов.
 */
export const requiredPhotoProps = () => [
  // @ts-expect-error alt обязателен
  <Photo
    key="alt"
    src={IMAGE}
    sizes="100vw"
  />,
  // @ts-expect-error sizes обязателен
  <Photo
    key="sizes"
    src={IMAGE}
    alt="x"
  />,
];

describe('кадр ядра: <picture> с картинкой из оптимизатора Next', () => {
  it.each(['(max-width: 640px) 100vw, 480px', '100vw'])(
    'P1: sizes «%s» — один <picture> с одним <img>, alt, sizes из пропса, srcset из оптимизатора, размеры кадра',
    async (sizes) => {
      await mount(
        <Photo
          src={IMAGE}
          alt={ALT}
          sizes={sizes}
        />,
      );

      const image = photoImage();

      expect(image.getAttribute('alt')).toBe(ALT);
      expect(image.getAttribute('sizes')).toBe(sizes);

      const candidates = (image.getAttribute('srcset') ?? '')
        .split(',')
        .map((candidate) => candidate.trim())
        .filter(Boolean);

      expect(candidates.length, `кандидатов srcset: ${candidates.join(' | ')}`).toBeGreaterThanOrEqual(2);

      for (const candidate of candidates) {
        expect(candidate.startsWith(OPTIMIZER_PREFIX), `кандидат «${candidate}» — адрес оптимизатора`).toBe(true);
        expect(candidate, `кандидат «${candidate}» — с дескриптором ширины`).toMatch(/ \d+w$/);
      }

      expect(image.getAttribute('width')).toBe('1200');
      expect(image.getAttribute('height')).toBe('1500');
    },
  );

  it('P2: без priority — ленивая загрузка, без высокого приоритета', async () => {
    await mount(
      <Photo
        src={IMAGE}
        alt={ALT}
        sizes="100vw"
      />,
    );

    const image = photoImage();

    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('fetchpriority')).not.toBe('high');
  });

  it('P3: priority (кадр первого экрана) — без ленивой загрузки, высокий приоритет', async () => {
    await mount(
      <Photo
        src={IMAGE}
        alt={ALT}
        sizes="100vw"
        priority
      />,
    );

    const image = photoImage();

    expect(['eager', null], 'loading — eager или атрибута нет').toContain(image.getAttribute('loading'));
    expect(image.getAttribute('fetchpriority')).toBe('high');
  });

  it.each(['dental', 'expert', 'coffee'])('P5: «%s» — оптимизатор Next отдает AVIF, затем WebP', async (app) => {
    const { default: config } = (await import(`../../apps/${app}/next.config.ts`)) as {
      default: { images?: { formats?: string[] } };
    };

    expect(config.images?.formats).toEqual(['image/avif', 'image/webp']);
  });
});

describe('кадр ядра в версии для слабовидящих', () => {
  it('L1: режим «без картинок» прячет <picture> кадра правилом ядра, стили кадра его не перебивают', async () => {
    await mount(
      <Photo
        src={IMAGE}
        alt={ALT}
        sizes="100vw"
      />,
    );

    const selectors = hiddenWhenImagesOff();

    expect(selectors.length, "правило html[data-lv-images='off'] :is(…) { display: none } в SCSS ядра").toBeGreaterThan(
      0,
    );

    const image = photoImage();
    const [picture] = pictures();

    expect(
      selectors.filter((selector) => picture?.matches(selector)),
      `<picture> подходит под один из селекторов: ${selectors.join(', ')}`,
    ).not.toEqual([]);

    for (const element of [picture, image]) {
      expect(element?.getAttribute('style') ?? '', `style у <${element?.tagName.toLowerCase()}>`).not.toMatch(
        /display/i,
      );
    }

    for (const file of scssFiles(PHOTO_DIR)) {
      expect(readScss(file), `${path.relative(REPO_ROOT, file)}: display с !important`).not.toMatch(
        /display\s*:[^;{}]*!important/,
      );
    }
  });

  it('L2: непустой alt — одна подпись data-lv-image-alt вне <picture> с текстом alt', async () => {
    await mount(
      <Photo
        src={IMAGE}
        alt={ALT}
        sizes="100vw"
      />,
    );

    const captions = [...container.querySelectorAll('[data-lv-image-alt]')];

    expect(captions, 'ровно одна подпись [data-lv-image-alt]').toHaveLength(1);
    expect(captions[0]?.closest('picture'), 'подпись вне <picture>: его прячет режим').toBeNull();
    expect(plain(captions[0]?.textContent)).toBe(ALT);
  });

  it('L3: пустой alt (декоративный кадр) — подписи нет, <img alt=""> есть', async () => {
    await mount(
      <Photo
        src={IMAGE}
        alt=""
        sizes="100vw"
      />,
    );

    expect(container.querySelectorAll('[data-lv-image-alt]'), 'подписей [data-lv-image-alt]').toHaveLength(0);
    expect(container.querySelectorAll('img[alt=""]'), '<img alt="">').toHaveLength(1);
  });
});

describe('проверка ключа кадра', () => {
  it('V1: пусто и ключ из карты — true; неизвестный ключ и другой регистр — строка-ошибка', async () => {
    const validate = validatePhotoKey(['doctor-lisitsyna', 'latte']);
    const check = (value: string | null | undefined) => validate(value, {} as never);

    for (const value of [undefined, null, '', 'doctor-lisitsyna', 'latte']) {
      expect(await check(value), `ключ ${JSON.stringify(value)}`).toBe(true);
    }

    const unknown = await check('no-such-photo');

    expect(typeof unknown, 'неизвестный ключ — строка-ошибка').toBe('string');
    expect(unknown).toContain('no-such-photo');
    expect(typeof (await check('Latte')), 'ключ в другом регистре — строка-ошибка').toBe('string');
  });
});
