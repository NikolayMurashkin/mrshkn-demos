import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scaffoldDemo } from '../../scripts/scaffold-demo';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

const TEMPLATE_SOURCE_FILES = ['package.json', 'src/demo.config.ts'];

let root: string;

const read = (...parts: string[]) => readFileSync(path.join(root, ...parts), 'utf8');

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'demos-scaffold-'));

  for (const file of TEMPLATE_SOURCE_FILES) {
    const target = path.join(root, 'apps/template', file);

    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.join(REPO_ROOT, 'apps/template', file), target);
  }
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('yarn demo:new <name>', () => {
  it('разворачивает apps/<name> из шаблона: свой пакет и свой поддомен', () => {
    const target = scaffoldDemo({ root, name: 'dental' });

    expect(target).toBe(path.join(root, 'apps/dental'));
    expect(JSON.parse(read('apps/dental/package.json')).name).toBe('@mrshkn/demo-dental');
    expect(read('apps/dental/src/demo.config.ts')).toContain("slug: 'dental'");
    expect(read('apps/dental/src/demo.config.ts')).not.toContain("slug: 'template'");
  });

  it('шаблон остается нетронутым', () => {
    scaffoldDemo({ root, name: 'dental' });

    expect(JSON.parse(read('apps/template/package.json')).name).toBe('@mrshkn/demo-template');
    expect(read('apps/template/src/demo.config.ts')).toContain("slug: 'template'");
  });

  it('не переносит сборки, зависимости, отчеты и медиатеку шаблона', () => {
    const leftovers = [
      'node_modules/pkg/index.js',
      '.next/build-manifest.json',
      '.next-production/build-manifest.json',
      '.lighthouseci/lhr.json',
      'test-results/result.json',
      'media/photo.jpg',
      'tsconfig.tsbuildinfo',
      'next-env.d.ts',
      '.env',
    ];

    for (const file of leftovers) {
      const target = path.join(root, 'apps/template', file);

      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, 'x');
    }

    scaffoldDemo({ root, name: 'dental' });

    for (const file of leftovers) {
      expect(existsSync(path.join(root, 'apps/dental', file)), file).toBe(false);
    }
  });

  it.each(['Dental', '1clinic', 'd', 'dental_clinic', 'стоматология', 'dental.clinic', 'a'.repeat(31)])(
    'отказывает имени «%s»: поддомен — латиница в нижнем регистре, цифры и дефис, с буквы',
    (name) => {
      expect(() => scaffoldDemo({ root, name })).toThrow(/имя/i);
      expect(existsSync(path.join(root, 'apps', name))).toBe(false);
    },
  );

  it.each(['template', 'www', 'stage', 'coolify', 'hello', 'kaup39'])('отказывает занятому поддомену «%s»', (name) => {
    expect(() => scaffoldDemo({ root, name })).toThrow(/занят/i);
  });

  it('не перезаписывает существующее демо', () => {
    scaffoldDemo({ root, name: 'dental' });
    writeFileSync(path.join(root, 'apps/dental/src/demo.config.ts'), 'edited');

    expect(() => scaffoldDemo({ root, name: 'dental' })).toThrow(/уже есть/i);
    expect(read('apps/dental/src/demo.config.ts')).toBe('edited');
  });

  it('если шаблон изменился и замена не прошла, недоделанного демо не остается', () => {
    writeFileSync(path.join(root, 'apps/template/src/demo.config.ts'), "export const DEMO = { slug: 'renamed' };\n");

    expect(() => scaffoldDemo({ root, name: 'dental' })).toThrow(/шаблон изменился/);
    expect(existsSync(path.join(root, 'apps/dental'))).toBe(false);
  });

  it('команда без имени завершается с ошибкой и подсказкой', () => {
    const result = spawnSync('yarn', ['demo:new'], { cwd: REPO_ROOT, encoding: 'utf8' });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('yarn demo:new <name>');
  });
});
