// 8 узлов «где болит» в модели auto.glb: точка выноски (anchor; на общем плане десктопа точки разнесены ≥ 50 px),
// сфера сканера при выборе (focus; focus.anchor — точка выноски выбранного узла, если она другая) и ракурс камеры
// (view). Оси модели: +X — вперед, +Y — вверх, +Z — к правому борту; метры. id совпадают с NODE_KEYS демо.
// Узлы, разнесенные по машине, показываются основным местом: тормоза — переднее правое колесо, подвеска — передняя
// правая стойка (у обоих еще место rear — у заднего колеса), выхлоп — приемная труба с катализатором. Сфера должна
// прорезать обшивку со стороны камеры, иначе дыры не видно: выхлоп и КПП машина показывает на подъемнике, камера
// смотрит снизу (угол от вертикали > 90°, камера не ниже 0,45 м над полом — под порогом и бампером), сфера режет
// днище; координаты — машины в покое, подъем добавляет сцена.
import type { NodeSpec, Overview } from './types';

const deg = (value: number) => (value * Math.PI) / 180;

// Общий план — кадр постера: камера 3/4 спереди справа. Два постера заданы объективом Blender (кадровое окно 36 мм
// по длинной стороне): 1440×900 — 30 мм, 390×844 — 26 мм и точка взгляда чуть выше и ближе к корме.
export const OVERVIEW: Overview = {
  eye: [4.3, 1.75, 3.3],
  posters: [
    { width: 390, height: 844, lens: 26, target: [-0.05, 0.62, 0] },
    { width: 1440, height: 900, lens: 30, target: [0, 0.55, 0] },
  ],
};

// Ракурс узла: азимут (0 — справа, 90° — спереди), угол от вертикали, радиус кадра в метрах (больше сферы — дыра
// в кузове целиком в кадре); смотрит в центр сферы. places — другие места разнесенного узла (симптом с place или
// клик рядом с ними): своя точка, сфера и ракурс. compact — точка на общем плане узкой сцены (телефон): там машина
// мелкая, и точки разнесены по всему кузову ≥ 48 px, по месту в узле (place — место, которое открывает клик по ней).
export const NODE_SPECS: NodeSpec[] = [
  {
    id: 'engine',
    anchor: [1.46, 0.97, 0.14],
    compact: { anchor: [1.46, 0.97, 0.14] },
    focus: { center: [1.44, 0.63, 0.13], radius: 0.62 },
    view: { azimuth: deg(58), polar: deg(58), radius: 1.0 },
    places: {
      timing: {
        anchor: [1.35, 0.78, 0.3],
        focus: { center: [1.48, 0.64, 0.5], radius: 0.5 },
        view: { azimuth: deg(12), polar: deg(78), radius: 0.32 },
      },
    },
  },
  {
    id: 'suspension',
    anchor: [1.28, 0.95, 0.6],
    compact: { anchor: [-1.3, 0.65, 0.6], place: 'rear' },
    focus: { center: [1.28, 0.6, 0.6], radius: 0.55 },
    view: { azimuth: deg(32), polar: deg(68), radius: 0.9 },
    places: {
      rear: {
        anchor: [-1.14, 0.55, 0.5],
        focus: { center: [-1.28, 0.5, 0.58], radius: 0.55 },
        view: { azimuth: deg(-32), polar: deg(68), radius: 0.9 },
      },
    },
  },
  {
    id: 'brakes',
    anchor: [1.2, 0.47, 0.73],
    compact: { anchor: [1.3, 0.25, 0.8] },
    focus: { center: [1.3, 0.34, 0.7], radius: 0.45 },
    view: { azimuth: deg(14), polar: deg(76), radius: 0.75 },
    places: {
      rear: {
        anchor: [-1.4, 0.47, 0.73],
        focus: { center: [-1.3, 0.34, 0.7], radius: 0.45 },
        view: { azimuth: deg(-14), polar: deg(76), radius: 0.75 },
      },
    },
  },
  {
    id: 'steering',
    anchor: [0.48, 1.12, -0.37],
    compact: { anchor: [0.4, 1.2, -0.4] },
    focus: { center: [0.8, 0.74, -0.25], radius: 0.7 },
    view: { azimuth: deg(150), polar: deg(62), radius: 1.05 },
  },
  {
    id: 'electrics',
    anchor: [1.7, 0.9, -0.55],
    compact: { anchor: [1.7, 0.9, -0.55] },
    focus: { center: [1.72, 0.64, -0.32], radius: 0.5 },
    view: { azimuth: deg(122), polar: deg(55), radius: 0.85 },
  },
  {
    id: 'cooling',
    anchor: [1.95, 0.6, -0.3],
    compact: { anchor: [2.0, 0.55, 0.3] },
    focus: { center: [1.76, 0.66, 0.12], radius: 0.55 },
    view: { azimuth: deg(76), polar: deg(66), radius: 0.9 },
  },
  {
    id: 'exhaust',
    anchor: [1.25, 0.65, 0.15],
    compact: { anchor: [-0.6, 0.3, 0.3] },
    focus: { center: [0.75, 0.3, 0.2], radius: 0.65, anchor: [0.72, 0.22, 0.24] },
    view: { azimuth: deg(-5), polar: deg(112), radius: 0.9 },
  },
  {
    id: 'transmission',
    anchor: [1.45, 0.55, -0.4],
    compact: { anchor: [0.2, 0.35, 0] },
    focus: { center: [1.35, 0.32, -0.4], radius: 0.62 },
    view: { azimuth: deg(100), polar: deg(112), radius: 0.8 },
  },
];
