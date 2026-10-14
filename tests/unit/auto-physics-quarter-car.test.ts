import assert from 'node:assert/strict';
import { test } from 'vitest';
import { PHYSICS } from '../../apps/auto/src/scene/physics/constants';
import {
  airborneShare,
  bumpRoad,
  cornerParams,
  energy,
  settlingTime,
  simulate,
} from '../../apps/auto/src/scene/physics/quarter-car';

// Перенос теста артборда `design/auto/scene/physics/quarter-car.test.js`: те же сценарии, числа и сообщения.

const S = PHYSICS.suspension;
const params = (wear: number) => cornerParams({ g: PHYSICS.g, ...S }, wear);
// Длинный прогон: у самого изношенного амортизатора качание успевает затухнуть.
const DURATION = 20;
const pass = (wear: number) =>
  simulate(params(wear), {
    road: bumpRoad({ height: S.bumpHeight, length: S.bumpLength, speed: S.speed, start: S.bumpStart }),
    duration: DURATION,
    dt: S.dt,
  });
const settle = (wear: number) => settlingTime(pass(wear), { from: S.bumpStart, fraction: S.settleFraction });
const wears = Array.from({ length: Math.round(S.wearMax / S.wearStep) + 1 }, (_, i) => i * S.wearStep);

test('со штатным амортизатором качание затухает до 5 % быстрее, чем с изношенным', () => {
  assert.equal(S.settleFraction, 0.05);
  const fresh = settle(0);
  const worn = settle(S.wearMax);
  assert.ok(Number.isFinite(worn), 'изношенный затухает в пределах прогона');
  assert.ok(fresh < worn, `новый ${fresh} с, изношенный ${worn} с`);
});

test('время затухания растет с износом монотонно на всем ходу ползунка', () => {
  const times = wears.map(settle);
  times
    .slice(1)
    .forEach((time, i) => assert.ok(time > times[i], `износ ${wears[i + 1]}: ${time} с не больше ${times[i]} с`));
});

test('без амортизатора и трения энергия системы сохраняется в пределах 1 % за 10 с', () => {
  const p = params(1);
  assert.equal(p.damping, 0);
  assert.ok(Math.abs(p.springRate - 20181) < 1, `жесткость ${p.springRate}`);
  // Кузов поднят на 5 см и отпущен на ровной дороге; 1 % — от энергии колебаний (сверх равновесия).
  const initial: [number, number, number, number] = [0.05, 0, 0, 0];
  const run = simulate(p, { duration: 10, dt: S.dt, initial, keepStates: true });
  const rest = energy(p, [0, 0, 0, 0]);
  const start = energy(p, initial) - rest;
  // keepStates сохраняет состояния каждого шага; без них уход энергии не посчитать.
  const states = run.states;
  assert.ok(states, 'keepStates: прогон вернул состояния');
  const drift = Math.max(...states.map((state) => Math.abs(energy(p, state) - rest - start)));
  assert.ok(start > 0);
  assert.ok(drift / start <= 0.01, `уход энергии ${((drift / start) * 100).toFixed(3)} %`);
  // Колебания идут на самом деле: кузов проходит через равновесие.
  assert.ok(Math.min(...run.body) < -0.04);
});

test('в равновесии на ровной дороге ничего не двигается', () => {
  const run = simulate(params(0), { duration: 2, dt: S.dt });
  assert.ok(Math.max(...run.body.map(Math.abs)) < 1e-9);
  assert.ok(run.contact.every((value) => value === 1));
});

test('с изношенным амортизатором колесо дольше теряет дорогу', () => {
  const window = { from: S.bumpStart, to: S.bumpStart + S.airWindow };
  const fresh = airborneShare(pass(0), window);
  const worn = airborneShare(pass(S.wearMax), window);
  assert.ok(worn > fresh, `новый ${fresh}, изношенный ${worn}`);
});
