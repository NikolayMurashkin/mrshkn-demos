import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `/favicon.ico` просят браузеры и поисковики без всякой ссылки — без файла адрес отдает 404. Next.js берет
 * `favicon.ico` только из корня `app/`, поэтому файл нужен в `src/app/` каждого демо, а у демо со своим значком —
 * свой ico, собранный из его `icon.svg`.
 */

const APPS_DIR = path.resolve(import.meta.dirname, '../../apps');

/** Демо — каждая папка `apps/*`, список из файловой системы: новое демо без значка роняет тест. */
const SLUGS = readdirSync(APPS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  .map((entry) => entry.name)
  .sort();

const HEADER_SIZE = 6;

const ENTRY_SIZE = 16;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const BITMAPINFOHEADER_SIZE = 40;

type IconEntry = { width: number; height: number; size: number; offset: number };

const faviconPath = (slug: string) => path.join(APPS_DIR, slug, 'src/app/favicon.ico');

const iconSvgPath = (slug: string) => path.join(APPS_DIR, slug, 'src/app/icon.svg');

const readFavicon = (slug: string) => {
  const file = faviconPath(slug);

  expect(existsSync(file), `apps/${slug}/src/app/favicon.ico есть`).toBe(true);

  return readFileSync(file);
};

/** Заголовок ICO и записи каталога; байт размера 0 означает 256 px. */
const readIcon = (slug: string) => {
  const file = readFavicon(slug);
  const count = file.readUInt16LE(4);
  const entries: IconEntry[] = Array.from({ length: count }, (_, index) => {
    const start = HEADER_SIZE + index * ENTRY_SIZE;

    return {
      width: file.readUInt8(start) || 256,
      height: file.readUInt8(start + 1) || 256,
      size: file.readUInt32LE(start + 8),
      offset: file.readUInt32LE(start + 12),
    };
  });

  return { file, reserved: file.readUInt16LE(0), type: file.readUInt16LE(2), count, entries };
};

/** Настоящий размер изображения внутри ico: PNG — из IHDR, BMP — из BITMAPINFOHEADER (высота — XOR и AND маски). */
const readImageSize = (image: Buffer, slug: string, label: string) => {
  if (image.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
  }

  expect(
    image.readUInt32LE(0),
    `apps/${slug}: изображение ${label} — ни PNG, ни BMP с BITMAPINFOHEADER (40 байт)`,
  ).toBe(BITMAPINFOHEADER_SIZE);

  return { width: image.readInt32LE(4), height: image.readInt32LE(8) / 2 };
};

/** Демо по значку: одинаковые байты `icon.svg` — одна группа. */
const groupByIconSvg = () => {
  const groups = new Map<string, string[]>();

  for (const slug of SLUGS) {
    const hash = createHash('sha256')
      .update(readFileSync(iconSvgPath(slug)))
      .digest('hex');

    groups.set(hash, [...(groups.get(hash) ?? []), slug]);
  }

  return [...groups.values()];
};

describe('список демо', () => {
  it('0.1: в apps/ есть auto, dental, expert, launch и template', () => {
    expect(SLUGS).toEqual(expect.arrayContaining(['auto', 'dental', 'expert', 'launch', 'template']));
  });
});

describe.each(SLUGS)('apps/%s/src/app/favicon.ico', (slug) => {
  it('1.1: файл есть, заголовок ICO — иконка не меньше чем из трех изображений', () => {
    const icon = readIcon(slug);

    expect(icon.reserved, `apps/${slug}: reserved в заголовке ICO`).toBe(0);
    expect(icon.type, `apps/${slug}: тип в заголовке ICO (1 — иконка)`).toBe(1);
    expect(icon.count, `apps/${slug}: изображений в ico`).toBeGreaterThanOrEqual(3);
  });

  it('1.2: изображения 16, 32 и 48 px, все квадратные', () => {
    const { entries } = readIcon(slug);

    for (const entry of entries) {
      expect(entry.width, `apps/${slug}: запись ${entry.width}×${entry.height} не квадратная`).toBe(entry.height);
    }

    expect(
      entries.map(({ width }) => width),
      `apps/${slug}: размеры изображений`,
    ).toEqual(expect.arrayContaining([16, 32, 48]));
  });

  it('1.3: данные каждого изображения непустые и целиком лежат в файле', () => {
    const { file, entries } = readIcon(slug);

    expect(entries.length, `apps/${slug}: записей в каталоге`).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(entry.size, `apps/${slug}: размер данных изображения ${entry.width} px`).toBeGreaterThan(0);
      expect(entry.offset + entry.size, `apps/${slug}: конец изображения ${entry.width} px`).toBeLessThanOrEqual(
        file.length,
      );
    }
  });

  it('1.4: настоящий размер каждого изображения совпадает с записью каталога', () => {
    const { file, entries } = readIcon(slug);

    expect(entries.length, `apps/${slug}: записей в каталоге`).toBeGreaterThan(0);

    for (const entry of entries) {
      const label = `${entry.width}×${entry.height}`;
      const image = file.subarray(entry.offset, entry.offset + entry.size);
      const size = readImageSize(image, slug, label);

      expect(size, `apps/${slug}: изображение записи ${label}`).toEqual({ width: entry.width, height: entry.height });
    }
  });
});

describe('favicon.ico совпадают ровно там, где совпадает icon.svg', () => {
  const groups = groupByIconSvg();

  it('2.1: у демо с одинаковым icon.svg favicon.ico побайтно равны', () => {
    for (const group of groups) {
      const [first, ...rest] = group;

      for (const other of rest) {
        expect(
          readFavicon(first).equals(readFavicon(other)),
          `icon.svg у ${first} и ${other} одинаковые, favicon.ico должны быть равны`,
        ).toBe(true);
      }
    }
  });

  it('2.2: у демо с разными icon.svg favicon.ico различаются', () => {
    for (const [index, group] of groups.entries()) {
      for (const otherGroup of groups.slice(index + 1)) {
        for (const slug of group) {
          for (const other of otherGroup) {
            expect(
              readFavicon(slug).equals(readFavicon(other)),
              `icon.svg у ${slug} и ${other} разные, favicon.ico должны различаться`,
            ).toBe(false);
          }
        }
      }
    }
  });

  it('2.3: есть что сравнивать — групп по icon.svg не меньше двух, хотя бы в одной два демо и больше', () => {
    expect(groups.length, 'групп демо по icon.svg').toBeGreaterThanOrEqual(2);
    expect(Math.max(...groups.map((group) => group.length)), 'демо в самой большой группе').toBeGreaterThanOrEqual(2);
  });
});
