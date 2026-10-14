// Цепь ГРМ из двух звездочек: коленвал ведет распредвал вдвое медленнее. Изношенная цепь длиннее (шарниры
// разбиты), натяжитель выбирает провис на свободной ветви, а рабочая ветвь между звездочками держит ту же длину
// меньшим числом звеньев — распредвал отстает на удлинение рабочей ветви. Без DOM и three.

export type ChainGeometry = {
  pitch: number;
  crankTeeth: number;
  camTeeth: number;
  crank: readonly number[];
  cam: readonly number[];
};

export type ChainDrive = {
  crankRadius: number;
  camRadius: number;
  center: number;
  span: number;
  length: number;
  ratio: number;
};

export type ChainThresholds = { wearLimit: number; errorShift: number; skipElongation: number };

export type ChainState = 'ok' | 'replace' | 'error' | 'skip';

// Радиус звездочки по шагу: окружность через центры роликов, звено — хорда.
export const pitchRadius = (pitch: number, teeth: number) => pitch / (2 * Math.sin(Math.PI / teeth));

// Геометрия привода: радиусы, межосевое расстояние, длина рабочей ветви (касательная между звездочками) и цепи.
// crank, cam — центры звездочек в плоскости цепи, метры.
export const chainDrive = ({ pitch, crankTeeth, camTeeth, crank, cam }: ChainGeometry): ChainDrive => {
  const crankRadius = pitchRadius(pitch, crankTeeth);
  const camRadius = pitchRadius(pitch, camTeeth);
  const center = Math.hypot(cam[0] - crank[0], cam[1] - crank[1]);
  const wrap = Math.asin((camRadius - crankRadius) / center);
  const span = center * Math.cos(wrap);
  const length = 2 * span + Math.PI * (crankRadius + camRadius) + 2 * wrap * (camRadius - crankRadius);

  return { crankRadius, camRadius, center, span, length, ratio: camTeeth / crankTeeth };
};

const DEG = 180 / Math.PI;

// Отставание распредвала, градусы коленвала, при относительном удлинении цепи elongation (0,01 — 1 %).
// Удлинение рабочей ветви span · elongation поворачивает звездочку распредвала назад на дугу этой длины, угол
// распредвала переводится в угол коленвала через передаточное число.
export const phaseShift = (drive: ChainDrive, elongation: number) =>
  ((drive.span * elongation) / drive.camRadius) * drive.ratio * DEG;

// Добавочный поворот звездочки распредвала, градусы распредвала: отставание, поэтому против вращения.
export const camLag = (drive: ChainDrive, elongation: number) => phaseShift(drive, elongation) / drive.ratio;

// Удлинение всей цепи, метры: для подписи «на сколько вытянулась».
export const stretchLength = (drive: ChainDrive, elongation: number) => drive.length * elongation;

// Состояние по таблице порогов: 'ok' — в пределах износа, 'replace' — удлинение дошло до предела износа (цепь пора
// менять), 'error' — сдвиг фаз вышел за норму производителя, 'skip' — удлинение в зоне риска перескока.
export const chainState = (
  drive: ChainDrive,
  elongation: number,
  { wearLimit, errorShift, skipElongation }: ChainThresholds,
): ChainState => {
  if (elongation >= skipElongation) return 'skip';
  if (phaseShift(drive, elongation) >= errorShift) return 'error';
  if (elongation >= wearLimit) return 'replace';

  return 'ok';
};
