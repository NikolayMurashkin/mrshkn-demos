import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTACTS_PHOTO_FRAME,
  CONTACTS_PHOTO_SIZES,
  MASTER_CARD_PHOTO_SIZES,
  MASTER_PHOTO_FRAME,
  MASTER_PORTRAIT_SIZES,
  WORK_PHOTO_FRAME,
  WORK_PHOTO_SIZES,
} from '../../apps/salon/src/consts';
import { coverSizes } from '../../apps/salon/src/lib/cover';

const SALON_SRC = path.resolve(import.meta.dirname, '../../apps/salon/src');

/** `aspect-ratio` первого правила с селектором `selector` в модуле стилей: `3 / 4` → { width: 3, height: 4 }. */
const scssFrame = (file: string, selector: string) => {
  const source = readFileSync(path.join(SALON_SRC, file), 'utf8');
  const body = new RegExp(`^${selector.replace('.', '\\.')}\\s*\\{([^}]*)`, 'm').exec(source)?.[1] ?? '';
  const match = /aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/.exec(body);

  expect(match, `нет aspect-ratio у ${selector} в ${file}`).not.toBeNull();

  return { width: Number(match?.[1]), height: Number(match?.[2]) };
};

describe('coverSizes салона: sizes кадра в рамке с object-fit: cover', () => {
  it('кадр уже рамки или той же пропорции — sizes без изменений', () => {
    expect(coverSizes(WORK_PHOTO_SIZES, { width: 1200, height: 1800 }, WORK_PHOTO_FRAME)).toBe(WORK_PHOTO_SIZES);
    expect(coverSizes(WORK_PHOTO_SIZES, { width: 1200, height: 1200 }, WORK_PHOTO_FRAME)).toBe(WORK_PHOTO_SIZES);
    expect(coverSizes(MASTER_CARD_PHOTO_SIZES, { width: 1200, height: 1600 }, MASTER_PHOTO_FRAME)).toBe(
      MASTER_CARD_PHOTO_SIZES,
    );
    expect(coverSizes(CONTACTS_PHOTO_SIZES, { width: 1600, height: 900 }, CONTACTS_PHOTO_FRAME)).toBe(
      CONTACTS_PHOTO_SIZES,
    );
  });

  it('кадр шире рамки — каждое условие умножено на пропорцию кадра / пропорцию рамки, вверх до целого', () => {
    expect(coverSizes(WORK_PHOTO_SIZES, { width: 1800, height: 1200 }, WORK_PHOTO_FRAME)).toBe(
      '(max-width: 480px) 150vw, (max-width: 720px) 75vw, 50vw',
    );
    expect(coverSizes(WORK_PHOTO_SIZES, { width: 1989, height: 1200 }, WORK_PHOTO_FRAME)).toBe(
      '(max-width: 480px) 166vw, (max-width: 720px) 83vw, 55vw',
    );
  });

  it('портрет 1400×1545 в рамке 3:4: множитель ≈ 1,208 и для vw, и для px', () => {
    expect(coverSizes(MASTER_CARD_PHOTO_SIZES, { width: 1400, height: 1545 }, MASTER_PHOTO_FRAME)).toBe(
      '(max-width: 480px) 121vw, (max-width: 720px) 61vw, (max-width: 1080px) 40vw, 31vw',
    );
    expect(coverSizes(MASTER_PORTRAIT_SIZES, { width: 1400, height: 1545 }, MASTER_PHOTO_FRAME)).toBe(
      '(max-width: 1080px) 290px, 40vw',
    );
  });

  it('длина-выражение — в calc() с множителем, запятые и пробелы в скобках не делят условие', () => {
    expect(
      coverSizes(
        '(min-width: 481px) and (max-width: 720px) calc(50vw - 24px), max(240px, 33vw)',
        { width: 2, height: 1 },
        WORK_PHOTO_FRAME,
      ),
    ).toBe('(min-width: 481px) and (max-width: 720px) calc(calc(50vw - 24px) * 2), calc(max(240px, 33vw) * 2)');
  });

  it('рамки в consts.ts — те же, что aspect-ratio в SCSS', () => {
    expect(scssFrame('components/MasterPhoto/MasterPhoto.module.scss', '.frame')).toEqual(MASTER_PHOTO_FRAME);
    expect(scssFrame('components/Works/Works.module.scss', '.photo')).toEqual(WORK_PHOTO_FRAME);
    expect(scssFrame('app/(site)/contacts/page.module.scss', '.photo')).toEqual(CONTACTS_PHOTO_FRAME);
  });
});
