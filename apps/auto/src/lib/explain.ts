import { PLOT } from '../consts';
import { PHYSICS } from '../scene/physics/constants';
import { airborneShare, bumpRoad, cornerParams, settlingTime, simulate, type Run } from '../scene/physics/quarter-car';
import { camLag, chainDrive, chainState, phaseShift, stretchLength } from '../scene/physics/timing-chain';
import type { Ride, SceneExplain } from '../types';

// Объяснялки карточки: расчеты по физике сцены, без DOM. Числа — только из таблицы констант.
const SUSPENSION = PHYSICS.suspension;
const CHAIN = PHYSICS.chain;
const DRIVE = chainDrive(CHAIN);

// Проезд кочки передней и задней осью: задняя наезжает позже на базу / скорость. Обе оси — одна и та же
// «четверть» (развесовку по осям не нашли), поэтому задняя — тот же расчет со сдвигом по времени. Цикл сцены — до
// затухания и паузы, не длиннее cycleMax.
export const REAR_DELAY = SUSPENSION.wheelbase / SUSPENSION.speed;

const rides = new Map<number, Ride>();

/** Расчет проезда при износе: один на значение ползунка, карточка и сцена берут один и тот же объект. */
export const rideFor = (wear: number): Ride => {
  const cached = rides.get(wear);

  if (cached) {
    return cached;
  }

  const params = cornerParams({ g: PHYSICS.g, ...SUSPENSION }, wear);
  const front = simulate(params, {
    road: bumpRoad({
      height: SUSPENSION.bumpHeight,
      length: SUSPENSION.bumpLength,
      speed: SUSPENSION.speed,
      start: SUSPENSION.bumpStart,
    }),
    duration: SUSPENSION.cycleMax,
    dt: SUSPENSION.dt,
  });
  const settle = settlingTime(front, { from: SUSPENSION.bumpStart, fraction: SUSPENSION.settleFraction });
  const ride = {
    front,
    settle,
    period: Math.min(SUSPENSION.bumpStart + REAR_DELAY + settle + SUSPENSION.cyclePause, SUSPENSION.cycleMax),
    air: airborneShare(front, { from: SUSPENSION.bumpStart, to: SUSPENSION.bumpStart + SUSPENSION.airWindow }),
  };

  rides.set(wear, ride);

  return ride;
};

let amplitude = 0;

// Масштаб графика — по самому изношенному: при движении ползунка оси не прыгают. Считается при первом графике.
const plotAmplitude = () => {
  amplitude ||= rideFor(SUSPENSION.wearMax).front.body.reduce((max, value) => Math.max(max, Math.abs(value)), 0) * 1.1;

  return amplitude;
};

const PLOT_SPAN = SUSPENSION.plotDuration;

export const plotX = (t: number) => PLOT.pad + ((PLOT.width - 2 * PLOT.pad) * t) / PLOT_SPAN;

export const plotY = (z: number) => PLOT.height / 2 - ((PLOT.height / 2 - PLOT.pad) * z) / plotAmplitude();

/** Ход кузова на графике: линия по точкам расчета, ≈ 240 точек на ширину. */
export const plotPath = ({ dt, body }: Run) => {
  const step = Math.max(1, Math.round(PLOT_SPAN / dt / 240));
  const points: string[] = [];

  for (let i = 0; i * dt <= PLOT_SPAN && i < body.length; i += step) {
    points.push(`${plotX(i * dt).toFixed(1)},${plotY(body[i]).toFixed(1)}`);
  }

  return `M${points.join('L')}`;
};

/** Отрезки времени без контакта колеса — полосы под графиком. */
export const airPath = ({ dt, contact }: Run) => {
  const parts: string[] = [];
  let start: number | null = null;
  const limit = Math.min(contact.length, Math.round(PLOT_SPAN / dt) + 1);

  for (let i = 0; i <= limit; i++) {
    const air = i < limit && contact[i] === 0;

    if (air && start === null) start = i;

    if (!air && start !== null) {
      const x0 = plotX(start * dt);
      const x1 = Math.max(plotX(i * dt), x0 + 1.5);

      parts.push(`M${x0.toFixed(1)},${PLOT.height - 3}H${x1.toFixed(1)}`);
      start = null;
    }
  }

  return parts.join('');
};

/** Положение линии «сейчас» на графике: за шириной графика — вне его. */
export const playheadX = (time: number) => (time <= PLOT_SPAN ? plotX(time) : -10);

/** Цепь при растяжении: сдвиг фаз по коленвалу, удлинение в мм, состояние по порогам, поворот звездочки. */
export const chainFor = (elongation: number) => ({
  shift: phaseShift(DRIVE, elongation),
  millimeters: stretchLength(DRIVE, elongation) * 1000,
  level: chainState(DRIVE, elongation, CHAIN),
  lag: (camLag(DRIVE, elongation) * Math.PI) / 180,
});

/** Шкала растяжения: где начинаются «пора менять», «вне нормы фаз» и «зона перескока», доли ползунка. */
export const chainZones = () => {
  const max = CHAIN.elongationMax;
  const errorAt = CHAIN.errorShift / phaseShift(DRIVE, 1);

  return { replace: CHAIN.wearLimit / max, error: errorAt / max, skip: CHAIN.skipElongation / max };
};

/** Что показать в сцене для карточки узла: качание машины, отставание звездочки или ничего. */
export const sceneExplainFor = (
  node: string | null,
  values: { wear: number; stretch: number },
): SceneExplain | null => {
  if (node === 'suspension') {
    const { front, period } = rideFor(values.wear);

    return {
      kind: 'suspension',
      ride: { front: { dt: front.dt, body: front.body }, rearDelay: REAR_DELAY, speed: SUSPENSION.speed, period },
    };
  }

  if (node === 'engine') {
    return { kind: 'chain', lag: chainFor(values.stretch).lag };
  }

  return null;
};

/** Начальные положения ползунков: износ — середина хода, растяжение — на пределе износа цепи («пора менять»). */
export const EXPLAIN_START = { wear: SUSPENSION.wearStart, stretch: CHAIN.wearLimit };
