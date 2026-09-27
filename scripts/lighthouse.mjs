import { spawnSync } from 'node:child_process';

const app = process.argv[2] ?? 'template';
const env = { ...process.env, LIGHTHOUSE_APP: app };

const run = (command, args, extraEnv = {}) => {
  const result = spawnSync(command, args, { stdio: 'inherit', env: { ...env, ...extraEnv } });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

console.log(`\n=== Сборка @mrshkn/demo-${app} для замера ===`);
run('yarn', ['workspace', `@mrshkn/demo-${app}`, 'build'], {
  DEMO_ENV: 'production',
  NEXT_DIST_DIR: '.next-production',
});

// Первый прогон на свежем раннере измеряет холодный Chrome и Node, а не страницу: TBT там в 3–4 раза
// выше остальных. Прогревочный прогон не попадает ни в assert, ни в отчеты.
console.log('\n=== Lighthouse CI: warm-up (не учитывается) ===');
run('yarn', ['lhci', 'collect', '--numberOfRuns=1']);

console.log(`\n=== Lighthouse CI: ${app} ===`);
run('yarn', ['lhci', 'autorun']);
