import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'vitest';
import { PHYSICS } from '../../apps/auto/src/scene/physics/constants';

// Перенос теста артборда `design/auto/scene/physics/constants.test.js`: те же сценарии, числа и сообщения;
// таблица источников — `SOURCES.md` рядом с таблицей констант демо.

const SOURCES = path.resolve(import.meta.dirname, '../../apps/auto/src/scene/physics/SOURCES.md');

// Ключи-листья таблицы: `suspension.bodyMass`, `chain.crank` (массив — одно значение).
const leaves = (value: unknown, path: string[] = []): string[] =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.entries(value).flatMap(([key, child]) => leaves(child, [...path, key]))
    : [path.join('.')];

// Строки таблицы SOURCES.md: | `ключ` | значение | источник |.
const rows = async () => {
  const text = await readFile(SOURCES, 'utf8');
  return new Map(
    [...text.matchAll(/^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|/gm)].map(([, key, value, source]) => [
      key,
      { value: value.trim(), source: source.trim() },
    ]),
  );
};

test('у каждого значения таблицы констант есть строка с источником в SOURCES.md', async () => {
  const table = await rows();
  leaves(PHYSICS).forEach((key) => {
    assert.ok(table.has(key), `нет строки ${key}`);
    assert.ok(table.get(key)?.source.length, `у ${key} пустой источник`);
  });
});

// Числа колонки «Значение» по-русски: «240 000», «9,80665», «(1,5; 0,44)» → [240000], [9.80665], [1.5, 0.44].
const numbers = (text: string) =>
  [...text.matchAll(/\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g)].map(([match]) =>
    Number(match.replace(/[   ]/g, '').replace(',', '.')),
  );

const valueAt = (key: string): unknown =>
  key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], PHYSICS);

test('число в колонке «Значение» SOURCES.md равно константе таблицы', async () => {
  const table = await rows();
  leaves(PHYSICS).forEach((key) => {
    const expected = [valueAt(key)].flat() as number[];
    const value = table.get(key)?.value ?? '';
    const written = numbers(value).slice(0, expected.length);
    expected.forEach((constant, i) => {
      const close = Math.abs(written[i] - constant) <= Math.max(1e-9, Math.abs(constant) * 1e-3);
      assert.ok(close, `${key}: в SOURCES.md ${value}, в таблице ${constant}`);
    });
  });
});

test('в SOURCES.md нет строк для ключей, которых нет в таблице', async () => {
  const keys = new Set(leaves(PHYSICS));
  [...(await rows()).keys()].forEach((key) => assert.ok(keys.has(key), `лишняя строка ${key}`));
});
