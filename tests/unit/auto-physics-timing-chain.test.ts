import assert from 'node:assert/strict';
import { test } from 'vitest';
import { PHYSICS } from '../../apps/auto/src/scene/physics/constants';
import {
  camLag,
  chainDrive,
  chainState,
  phaseShift,
  pitchRadius,
} from '../../apps/auto/src/scene/physics/timing-chain';

// Перенос теста артборда `design/auto/scene/physics/timing-chain.test.js`: те же сценарии, числа и сообщения.

const C = PHYSICS.chain;
const drive = chainDrive(C);

test('радиусы звездочек по шагу совпадают с CONTRACT.md', () => {
  assert.ok(Math.abs(pitchRadius(C.pitch, C.crankTeeth) - 0.0386) < 0.0001);
  assert.ok(Math.abs(pitchRadius(C.pitch, C.camTeeth) - 0.0769) < 0.0001);
});

test('при нулевом растяжении сдвиг фаз равен нулю', () => {
  assert.equal(phaseShift(drive, 0), 0);
  assert.equal(camLag(drive, 0), 0);
});

test('сдвиг фаз растет линейно с растяжением', () => {
  const step = C.elongationStep;
  const shifts = Array.from({ length: Math.round(C.elongationMax / step) + 1 }, (_, i) => phaseShift(drive, i * step));
  const first = shifts[1] - shifts[0];
  assert.ok(first > 0);
  shifts.slice(1).forEach((shift, i) => assert.ok(Math.abs(shift - shifts[i] - first) < 1e-9, `шаг ${i}`));
  // Распредвал вращается вдвое медленнее: угол звездочки — половина сдвига по коленвалу.
  assert.ok(Math.abs(camLag(drive, C.elongationMax) - phaseShift(drive, C.elongationMax) / 2) < 1e-12);
});

test('состояние цепи меняется ровно на порогах таблицы', () => {
  const errorAt = C.errorShift / phaseShift(drive, 1);
  assert.ok(
    C.wearLimit < errorAt && errorAt < C.skipElongation && C.skipElongation <= C.elongationMax,
    'пороги на шкале ползунка по порядку',
  );
  assert.equal(chainState(drive, C.wearLimit * 0.999, C), 'ok');
  assert.equal(chainState(drive, C.wearLimit, C), 'replace');
  assert.equal(chainState(drive, errorAt * 0.999, C), 'replace');
  assert.equal(chainState(drive, errorAt * 1.001, C), 'error');
  assert.equal(chainState(drive, C.skipElongation * 0.999, C), 'error');
  assert.equal(chainState(drive, C.skipElongation, C), 'skip');
  // Порог берется из переданной таблицы, а не из кода: сдвинули в таблице — сдвинулось состояние.
  const moved = { ...C, errorShift: C.errorShift * 1.3, wearLimit: C.wearLimit * 3 };
  assert.equal(chainState(drive, errorAt * 1.1, moved), 'ok');
});
