import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { scaffoldDemo } from './scaffold-demo.ts';

const USAGE = 'Использование: yarn demo:new <name> — имя станет поддоменом <name>.mrshkn.com';

const [name] = process.argv.slice(2);

if (!name) {
  console.error(USAGE);
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, '..');

try {
  scaffoldDemo({ root, name });
} catch (error) {
  console.error(`Демо не создано: ${(error as Error).message}\n${USAGE}`);
  process.exit(1);
}

// новое приложение — новый workspace: без установки yarn его не увидит, а на CI установка по умолчанию immutable
const install = spawnSync('yarn', ['install', '--no-immutable'], { cwd: root, stdio: 'inherit' });

if (install.status !== 0) {
  process.exit(install.status ?? 1);
}

console.log(`
Демо «${name}» создано: apps/${name}, пакет @mrshkn/demo-${name}.
Дальше:
  apps/${name}/src/demo.config.ts   дело, schema.org, Mini App и отзывы
  yarn workspace @mrshkn/demo-${name} dev -p 3300
  yarn test:lighthouse ${name}
`);
