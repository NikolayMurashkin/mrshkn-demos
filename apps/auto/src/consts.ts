import type { DemoLang } from '@mrshkn/demo-core/types';
import type { StageCanvas } from './types';

/** Языки демо: первый — язык по умолчанию, на него ведут `/` и `/privacy`. */
export const LANGS: DemoLang[] = ['ru', 'en'];

export const DEFAULT_LANG: DemoLang = 'ru';

export const LANG_CODES: Record<DemoLang, string> = { ru: 'RU', en: 'EN' };

/** Цены в рублях на русском и в долларах рынка США на английском: работа без запчастей, не пересчет курса. */
export const NUMBER_LOCALES: Record<DemoLang, string> = { ru: 'ru-RU', en: 'en-US' };

export const CURRENCIES: Record<DemoLang, string> = { ru: 'RUB', en: 'USD' };

/** Узлы «где болит» в порядке сцены. */
export const NODE_KEYS = [
  'engine',
  'suspension',
  'brakes',
  'steering',
  'electrics',
  'cooling',
  'exhaust',
  'transmission',
] as const;

/** Места разнесенных узлов в сцене: привод ГРМ у двигателя, задняя ось у подвески и тормозов. */
export const SYMPTOM_PLACES = ['timing', 'rear'] as const;

/** Пустые места под объяснялки в карточках узлов: их наполнит интерактив сцены. */
export const EXPLAINERS: Partial<Record<string, 'suspension' | 'chain'>> = {
  suspension: 'suspension',
  engine: 'chain',
};

/** Постер под холст телефона. */
export const POSTER_NARROW_MEDIA = '(max-width: 480px)';

/** Раскладка в колонку: сцена во всю ширину сверху, под ней карточка и симптомы. */
export const STACKED_MEDIA = '(max-width: 1023px)';

/**
 * Боковые колонки первого экрана на широком окне — сумма максимумов колонок симптомов (360) и карточки (400)
 * из сетки `WhereItHurts.module.scss`: холст сцены — остаток ширины окна.
 */
export const STAGE_SIDE_COLUMNS = 760;

/** Высота холста на широком окне — `.stage` в `WhereItHurts.module.scss`: `height: 100svh; min-height: 560px`. */
export const STAGE_MIN_HEIGHT = 560;

/** Высота холста в раскладке в колонку — `--auto-stage-height` в `tokens.scss`: `clamp(280px, 52svh, 520px)`. */
export const STAGE_STACKED_HEIGHT = { min: 280, svh: 52, max: 520 };

/** Холсты сцены для `sizes` постера: на широком окне — средняя колонка сетки, в колонку — вся ширина окна. */
export const STAGE_CANVAS: Record<'column' | 'stacked', StageCanvas> = {
  column: { width: `calc(100vw - ${STAGE_SIDE_COLUMNS}px)`, height: `max(100svh, ${STAGE_MIN_HEIGHT}px)` },
  stacked: {
    width: '100vw',
    height: `clamp(${STAGE_STACKED_HEIGHT.min}px, ${STAGE_STACKED_HEIGHT.svh}svh, ${STAGE_STACKED_HEIGHT.max}px)`,
  },
};

export const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';

/** Профиль телефона для сцены: палец вместо мыши — DPR ≤ 1,5, MSAA ×2, без зеркала пола. */
export const PHONE_MEDIA = '(pointer: coarse)';

/** Цвета сцены — токены страницы: фон пленки, полоса сканера (спад и ядро), срез кузова, янтарь выбранного узла. */
export const SCENE_COLOR_TOKENS = {
  bg: '--demo-bg',
  xray: '--auto-xray',
  peak: '--auto-xray-peak',
  cut: '--auto-film-deep',
  amber: '--demo-accent',
} as const;

/** Клик по сцене — короткое касание без сдвига: дальше `slop` пикселей или дольше `time` мс — это поворот. */
export const SCENE_CLICK = { slop: 6, time: 500 };

/** Подпись точки узла — справа от нее на `offset` пикселей, а если не влезает в сцену — слева. */
export const HOTSPOT_LABEL = { offset: 36, gap: 8 };

/** График хода кузова в объяснялке подвески: размер viewBox и поле, пиксели. */
export const PLOT = { width: 320, height: 128, pad: 6 };
