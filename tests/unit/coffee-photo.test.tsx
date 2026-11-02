/** @vitest-environment happy-dom */
import type { StaticImageData } from 'next/image';
import path from 'node:path';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

/**
 * Карта кадров «Кофейни» — статические импорты `.jpg`: vite отдает за них строку адреса, а `Photo` ждет объект
 * с размерами, как у Next. Карта подменяется объектами Next по тем же ключам; сама карта — обычный объект,
 * поэтому `toString` и `constructor` в нем находятся через прототип.
 */
vi.mock('../../apps/coffee/src/assets/photos/index.ts', async () => {
  const { PHOTO_KEYS } = (await import(
    /* @vite-ignore */ path.resolve(import.meta.dirname, '../../apps/coffee/src/assets/photos/keys.ts')
  )) as { PHOTO_KEYS: string[] };

  return {
    PHOTOS: Object.fromEntries(
      PHOTO_KEYS.map((key) => [key, { src: `/_next/static/media/${key}.0a1b2c3d.jpg`, width: 1600, height: 1200 }]),
    ),
  };
});

type MenuItem = {
  slug: string;
  name: string;
  description?: string;
  photo?: string;
  price: number;
  category: string;
  tags: string[];
};

type MenuOption = { slug: string; name: string };

type MenuBoardProps = {
  items: MenuItem[];
  categories: MenuOption[];
  tags: MenuOption[];
  resetHref: string;
  single?: boolean;
};

type PhotoModule = { photoOf: (key: string | null | undefined) => StaticImageData | undefined };

type SeedModule = { MENU_ITEMS: MenuItem[]; MENU_CATEGORIES: MenuOption[]; MENU_TAGS: MenuOption[] };

const COFFEE_SRC = path.resolve(import.meta.dirname, '../../apps/coffee/src');

const importCoffee = async <T,>(relative: string): Promise<T> =>
  (await import(/* @vite-ignore */ path.join(COFFEE_SRC, relative))) as T;

const loadPhotoOf = async () => (await importCoffee<PhotoModule>('lib/photo.ts')).photoOf;

const loadPhotos = async () =>
  (await importCoffee<{ PHOTOS: Record<string, StaticImageData> }>('assets/photos/index.ts')).PHOTOS;

const loadSeed = () => importCoffee<SeedModule>('cms/seed/data.ts');

const loadMenuBoard = async () =>
  (await importCoffee<{ MenuBoard: ComponentType<MenuBoardProps> }>('components/MenuBoard/index.ts')).MenuBoard;

describe('кадр позиции по ключу CMS — photoOf', () => {
  it('P1: ключ карты — кадр из карты', async () => {
    const photoOf = await loadPhotoOf();
    const PHOTOS = await loadPhotos();

    expect(photoOf('espresso')).toBe(PHOTOS.espresso);
    expect(photoOf('window')).toBe(PHOTOS.window);
  });

  it('P2: ключа нет в карте — без кадра', async () => {
    const photoOf = await loadPhotoOf();

    expect(photoOf('latte-macchiato')).toBeUndefined();
  });

  it('P3: имена свойств прототипа объекта — не кадры', async () => {
    const photoOf = await loadPhotoOf();

    for (const key of ['toString', 'constructor', 'hasOwnProperty', '__proto__']) {
      expect(photoOf(key), key).toBeUndefined();
    }
  });

  it('P4: пустое поле — без кадра', async () => {
    const photoOf = await loadPhotoOf();

    expect(photoOf('')).toBeUndefined();
    expect(photoOf(undefined)).toBeUndefined();
    expect(photoOf(null)).toBeUndefined();
  });
});

describe('миниатюры меню — MenuBoard', () => {
  const render = async (single: boolean) => {
    const MenuBoard = await loadMenuBoard();
    const { MENU_ITEMS, MENU_CATEGORIES, MENU_TAGS } = await loadSeed();
    const items: MenuItem[] = [
      ...MENU_ITEMS,
      { slug: 'no-photo', name: 'Без кадра', price: 100, category: 'coffee', tags: [] },
      { slug: 'prototype-key', name: 'Ключ прототипа', photo: 'toString', price: 100, category: 'coffee', tags: [] },
    ];
    const markup = renderToStaticMarkup(
      <MenuBoard
        items={items}
        categories={MENU_CATEGORIES}
        tags={MENU_TAGS}
        resetHref="/menu"
        single={single}
      />,
    );
    const body = new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html').body;

    return { body, seedWithPhoto: MENU_ITEMS.filter(({ photo }) => photo).length };
  };

  it('M1: полное меню — по миниатюре у каждой позиции с кадром, у остальных нет', async () => {
    const { body, seedWithPhoto } = await render(false);

    expect(seedWithPhoto, 'в засеве кадр у каждой из 16 позиций').toBe(16);
    expect(body.querySelectorAll('li')).toHaveLength(18);
    expect(body.querySelectorAll('img')).toHaveLength(seedWithPhoto);

    for (const image of body.querySelectorAll('img')) {
      expect(image.getAttribute('alt'), 'миниатюра без подписи: название рядом текстом').toBe('');
    }
  });

  it('M2: QR-меню (single) — ни одной картинки', async () => {
    const { body } = await render(true);

    expect(body.querySelectorAll('li')).toHaveLength(18);
    expect(body.querySelectorAll('img, picture')).toHaveLength(0);
  });
});
