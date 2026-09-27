import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

const CORE_COMPONENTS = path.join(REPO_ROOT, 'packages/core/src/components');

/** Именованный цвет в значении свойства: `color: white`, `border: 1px solid black`. */
const NAMED_COLOR =
  /:[^;{]*\b(white|black|red|green|blue|gray|grey|silver|orange|yellow|purple|pink|brown|navy|teal)\b/i;

const scssFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return scssFiles(full);
    }

    return entry.name.endsWith('.scss') ? [full] : [];
  });

const usedTokens = () =>
  new Set(
    scssFiles(CORE_COMPONENTS).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/var\((--demo-[\w-]+)/g)].map((match) => match[1]),
    ),
  );

const APPS = readdirSync(path.join(REPO_ROOT, 'apps')).filter((name) =>
  existsSync(path.join(REPO_ROOT, 'apps', name, 'package.json')),
);

describe('токены общих компонентов', () => {
  it('компоненты ядра берут цвета, шрифт, радиусы и тени только из токенов --demo-*', () => {
    for (const file of scssFiles(CORE_COMPONENTS)) {
      const source = readFileSync(file, 'utf8');

      expect(source, file).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
      expect(source, file).not.toMatch(/(font-family|border-radius|box-shadow)\s*:(?!\s*var\()/);
      expect(source, file).not.toMatch(NAMED_COLOR);
    }

    expect(usedTokens().size).toBeGreaterThan(0);
  });

  it.each(APPS)('демо «%s» задает каждый токен, который берут компоненты ядра', (app) => {
    const tokens = readFileSync(path.join(REPO_ROOT, 'apps', app, 'src/styles/tokens.scss'), 'utf8');

    for (const token of usedTokens()) {
      expect(tokens, token).toMatch(new RegExp(`${token}\\s*:`));
    }
  });
});
