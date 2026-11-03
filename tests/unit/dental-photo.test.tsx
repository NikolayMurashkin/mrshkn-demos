/** @vitest-environment happy-dom */
import type { StaticImageData } from 'next/image';
import path from 'node:path';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

/**
 * Карта кадров «Клиники» — статические импорты `.jpg`: vite отдает за них строку адреса, а `Photo` ждет объект
 * с размерами, как у Next. Карта подменяется объектами Next по тем же ключам; сама карта — обычный объект,
 * поэтому `toString` и `constructor` в нем находятся через прототип.
 */
vi.mock('../../apps/dental/src/assets/photos/index.ts', async () => {
  const { PHOTO_KEYS } = (await import(
    /* @vite-ignore */ path.resolve(import.meta.dirname, '../../apps/dental/src/assets/photos/keys.ts')
  )) as { PHOTO_KEYS: string[] };

  return {
    PHOTOS: Object.fromEntries(
      PHOTO_KEYS.map((key) => [key, { src: `/_next/static/media/${key}.0a1b2c3d.jpg`, width: 1200, height: 1500 }]),
    ),
  };
});

type Doctor = {
  id: number;
  name: string;
  slug: string;
  position: string;
  practiceSince: number;
  photo?: string | null;
};

type PhotoModule = { photoOf: (key: string | null | undefined) => StaticImageData | undefined };

const DENTAL_SRC = path.resolve(import.meta.dirname, '../../apps/dental/src');

const importDental = async <T,>(relative: string): Promise<T> =>
  (await import(/* @vite-ignore */ path.join(DENTAL_SRC, relative))) as T;

const loadPhotoOf = async () => (await importDental<PhotoModule>('lib/photo.ts')).photoOf;

const loadPhotos = async () =>
  (await importDental<{ PHOTOS: Record<string, StaticImageData> }>('assets/photos/index.ts')).PHOTOS;

const loadDoctorCards = async () =>
  (await importDental<{ DoctorCards: ComponentType<{ doctors: Doctor[] }> }>('components/DoctorCards/index.ts'))
    .DoctorCards;

describe('кадр врача по ключу CMS — photoOf', () => {
  it('F1: ключ карты — кадр из карты', async () => {
    const photoOf = await loadPhotoOf();
    const PHOTOS = await loadPhotos();

    expect(PHOTOS.lisitsyna, 'кадр lisitsyna в карте').toBeDefined();
    expect(photoOf('lisitsyna')).toBe(PHOTOS.lisitsyna);
  });

  it('F2: ключа нет в карте — без кадра', async () => {
    const photoOf = await loadPhotoOf();

    expect(photoOf('unknown')).toBeUndefined();
  });

  it('F3: имена свойств прототипа объекта — не кадры', async () => {
    const photoOf = await loadPhotoOf();

    for (const key of ['constructor', 'toString', 'hasOwnProperty', '__proto__']) {
      expect(photoOf(key), key).toBeUndefined();
    }
  });

  it('F4: пустое поле — без кадра', async () => {
    const photoOf = await loadPhotoOf();

    expect(photoOf(null)).toBeUndefined();
    expect(photoOf('')).toBeUndefined();
    expect(photoOf(undefined)).toBeUndefined();
  });
});

describe('портрет в карточке врача — DoctorCards', () => {
  const doctor = (slug: string, name: string, photo?: string | null): Doctor => ({
    id: slug.length,
    name,
    slug,
    position: 'Стоматолог-терапевт',
    practiceSince: 2012,
    photo,
  });

  const render = async (doctors: Doctor[]) => {
    const DoctorCards = await loadDoctorCards();
    const markup = renderToStaticMarkup(<DoctorCards doctors={doctors} />);

    return new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;
  };

  it('C1: врач с кадром — портрет без подписи, плашки инициалов нет', async () => {
    const body = await render([doctor('lisitsyna', 'Лисицына Вера Андреевна', 'lisitsyna')]);
    const images = body.querySelectorAll('img');

    expect(images).toHaveLength(1);
    expect(images[0]?.getAttribute('alt'), 'портрет без подписи: имя рядом текстом').toBe('');
    expect(images[0]?.getAttribute('src') ?? '', 'файл портрета').toContain('lisitsyna');
    expect(body.textContent, 'инициалы «ВЛ»').not.toContain('ВЛ');
  });

  it('C2: врач без кадра, с ключом не из карты или ключом прототипа — плашка инициалов, картинки нет', async () => {
    const body = await render([
      doctor('empty', 'Пустов Игорь Петрович'),
      doctor('unknown', 'Незнаев Олег Ильич', 'unknown'),
      doctor('proto', 'Прототипов Глеб Юрьевич', 'constructor'),
    ]);

    expect(body.querySelectorAll('img, picture')).toHaveLength(0);
    expect(body.querySelectorAll('li')).toHaveLength(3);

    for (const card of body.querySelectorAll('li')) {
      expect(card.querySelector('[aria-hidden="true"]')?.textContent?.trim(), 'плашка инициалов').toMatch(/^\S{2}$/);
    }
  });
});
