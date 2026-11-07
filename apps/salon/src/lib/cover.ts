import type { PhotoFrame } from '../types';

/** Знаков множителя внутри `calc()`: округление вверх — файл не выйдет мельче отрисовки. */
const FACTOR_SCALE = 10_000;

const PLAIN_LENGTH = /^(\d+(?:\.\d+)?)(px|vw)$/;

const scaleLength = (length: string, factor: number) => {
  const match = PLAIN_LENGTH.exec(length);

  if (!match) {
    return `calc(${length} * ${Math.ceil(factor * FACTOR_SCALE) / FACTOR_SCALE})`;
  }

  return `${Math.ceil(Number(match[1]) * factor)}${match[2]}`;
};

/** Пробел перед длиной условия: последний вне скобок (в `calc(100vw - 32px)` пробелы внутри). */
const lengthStart = (entry: string) => {
  let depth = 0;

  for (let index = entry.length - 1; index >= 0; index -= 1) {
    const char = entry[index];

    if (char === ')') {
      depth += 1;
    } else if (char === '(') {
      depth -= 1;
    } else if (char === ' ' && depth === 0) {
      return index;
    }
  }

  return -1;
};

/** Условия `sizes`: запятые вне скобок (в `max(240px, 33vw)` запятая внутри). */
const splitEntries = (sizes: string) => {
  const entries: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < sizes.length; index += 1) {
    const char = sizes[index];

    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      entries.push(sizes.slice(start, index));
      start = index + 1;
    }
  }

  return [...entries, sizes.slice(start)];
};

const scaleEntry = (entry: string, factor: number) => {
  const trimmed = entry.trim();
  const split = lengthStart(trimmed);

  if (split === -1) {
    return scaleLength(trimmed, factor);
  }

  return `${trimmed.slice(0, split)} ${scaleLength(trimmed.slice(split + 1), factor)}`;
};

/**
 * `sizes` кадра в рамке с `object-fit: cover`: ширина отрисовки, а не рамки. Кадр шире пропорции рамки вписан
 * по высоте и шире рамки в (пропорция кадра / пропорция рамки) раз — ширина каждого условия `sizes` растет во столько же;
 * кадр не шире рамки — `sizes` как есть. Длины условий — `px`, `vw` или выражение (тогда — в `calc()`).
 */
export const coverSizes = (sizes: string, image: PhotoFrame, frame: PhotoFrame) => {
  if (image.width * frame.height <= image.height * frame.width) {
    return sizes;
  }

  const factor = (image.width * frame.height) / (image.height * frame.width);

  return splitEntries(sizes)
    .map((entry) => scaleEntry(entry, factor))
    .join(', ');
};
