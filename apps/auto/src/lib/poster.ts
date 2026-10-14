import type { StageCanvas } from '../types';

/** Знаков пропорции в `sizes`: округление вверх — рисунок не выйдет мельче, чем его покажет холст. */
const RATIO_SCALE = 10_000;

/**
 * Ширина рисунка постера в холсте для `sizes`: при `object-fit: cover` рисунок шире холста, когда холст уже пропорции
 * файла, — тогда ширину задает высота холста.
 */
export const coverSizes = (canvas: StageCanvas, image: { width: number; height: number }) => {
  const ratio = Math.ceil((image.width / image.height) * RATIO_SCALE) / RATIO_SCALE;

  return `max(${canvas.width}, calc(${ratio} * ${canvas.height}))`;
};
