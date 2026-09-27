import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DEMO_SLUG_PATTERN, RESERVED_SLUGS } from '../packages/core/src/consts.ts';

type ScaffoldOptions = {
  root: string;
  name: string;
};

const TEMPLATE = 'template';

/** Сборки, зависимости, отчеты, медиатека и секреты шаблона в новое демо не переезжают. */
const SKIPPED = new Set([
  'node_modules',
  '.lighthouseci',
  'test-results',
  'playwright-report',
  'media',
  'next-env.d.ts',
  '.env',
]);

const isCopied = (source: string) => {
  const name = path.basename(source);

  return !SKIPPED.has(name) && !name.startsWith('.next') && !name.endsWith('.tsbuildinfo');
};

const replaceIn = (file: string, from: string, to: string) => {
  const source = readFileSync(file, 'utf8');

  if (!source.includes(from)) {
    throw new Error(`в ${file} нет «${from}» — шаблон изменился, поправьте scripts/scaffold-demo.ts`);
  }

  writeFileSync(file, source.replace(from, to));
};

/** Копирует `apps/template` в `apps/<name>` и переименовывает пакет и поддомен. Возвращает путь нового демо. */
export const scaffoldDemo = ({ root, name }: ScaffoldOptions) => {
  if (!DEMO_SLUG_PATTERN.test(name)) {
    throw new Error(
      `имя «${name}» не годится для поддомена: латиница в нижнем регистре, цифры и дефис, с буквы, 2–30 знаков`,
    );
  }

  if (RESERVED_SLUGS.includes(name)) {
    throw new Error(`поддомен «${name}» занят студией или ее проектами`);
  }

  const target = path.join(root, 'apps', name);

  if (existsSync(target)) {
    throw new Error(`демо «${name}» уже есть: apps/${name}`);
  }

  cpSync(path.join(root, 'apps', TEMPLATE), target, { recursive: true, filter: isCopied });

  // недоделанная копия с чужим поддоменом или именем пакета хуже, чем никакой: повтор команды ответил бы «уже есть»
  try {
    replaceIn(path.join(target, 'package.json'), `"@mrshkn/demo-${TEMPLATE}"`, `"@mrshkn/demo-${name}"`);
    replaceIn(path.join(target, 'src/demo.config.ts'), `slug: '${TEMPLATE}'`, `slug: '${name}'`);
  } catch (error) {
    rmSync(target, { recursive: true, force: true });
    throw error;
  }

  return target;
};
