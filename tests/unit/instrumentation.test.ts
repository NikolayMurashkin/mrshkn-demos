import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { register } from '@mrshkn/demo-core/instrumentation';

/**
 * Payload демо поднимается при старте процесса, до первого запроса: миграции не ждут посетителя, а хостинг узнает
 * о мертвой базе по выходу процесса. Подъем идет только в рантайме Node.js и не на фазе сборки; упал — ошибка в лог
 * и выход с ненулевым кодом. Payload и конфиг приложения — моки: проверяется сам вызов.
 */

const mocks = vi.hoisted(() => ({
  config: { label: 'конфиг приложения' },
  getPayload: vi.fn(),
}));

vi.mock('payload', () => ({ getPayload: mocks.getPayload }));

vi.mock('@payload-config', () => ({ default: mocks.config }));

const APPS_DIR = path.resolve(import.meta.dirname, '../../apps');

const APPS = readdirSync(APPS_DIR).filter((name) => existsSync(path.join(APPS_DIR, name, 'package.json')));

const ENV_KEYS = ['NEXT_RUNTIME', 'NEXT_PHASE'] as const;

type EnvKey = (typeof ENV_KEYS)[number];

let savedEnv: Partial<Record<EnvKey, string>>;
let exit: MockInstance<typeof process.exit>;
let errors: MockInstance<typeof console.error>;

const setEnv = (env: Partial<Record<EnvKey, string>>) => {
  for (const key of ENV_KEYS) {
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }
};

beforeEach(() => {
  savedEnv = { NEXT_RUNTIME: process.env.NEXT_RUNTIME, NEXT_PHASE: process.env.NEXT_PHASE };
  mocks.getPayload.mockReset();
  mocks.getPayload.mockResolvedValue({});
  exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  errors = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  setEnv(savedEnv);
});

describe('подъем Payload при старте процесса', () => {
  it('U1: рантайм nodejs вне сборки — getPayload один раз с конфигом приложения и cron: true', async () => {
    setEnv({ NEXT_RUNTIME: 'nodejs' });

    await register();

    expect(mocks.getPayload, 'вызовов getPayload').toHaveBeenCalledTimes(1);

    const [options] = mocks.getPayload.mock.calls[0] as [{ config?: unknown; cron?: unknown }];

    expect(options.config, 'конфиг — default из @payload-config').toBe(mocks.config);
    expect(options.cron, 'cron: true — иначе задачи по расписанию не крутятся').toBe(true);
  });

  it('U2: рантайм edge — getPayload не вызван, выхода нет', async () => {
    setEnv({ NEXT_RUNTIME: 'edge' });

    await register();

    expect(mocks.getPayload).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('U3: фаза сборки — getPayload не вызван, выхода нет', async () => {
    setEnv({ NEXT_RUNTIME: 'nodejs', NEXT_PHASE: 'phase-production-build' });

    await register();

    expect(mocks.getPayload).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('U4: getPayload отклонен — ошибка в лог и выход с ненулевым кодом', async () => {
    setEnv({ NEXT_RUNTIME: 'nodejs' });

    const failure = new Error('db down');

    mocks.getPayload.mockRejectedValue(failure);

    // Выход замокан, процесс живет дальше: реализации разрешено и пробросить ошибку после выхода.
    await register().catch(() => undefined);

    await vi.waitFor(() => expect(exit, 'process.exit после отказа подъема').toHaveBeenCalled(), { timeout: 2000 });

    expect(
      errors.mock.calls.some((call) => call.includes(failure)),
      `console.error без самой ошибки подъема; было: ${JSON.stringify(errors.mock.calls.map((call) => call.map(String)))}`,
    ).toBe(true);
    expect(
      exit.mock.calls.some(([code]) => typeof code === 'number' && code !== 0),
      `код выхода не ненулевой: ${JSON.stringify(exit.mock.calls)}`,
    ).toBe(true);
  });

  it('U5: NEXT_RUNTIME не задан (Node вне Next, например CLI Payload) — getPayload не вызван', async () => {
    setEnv({});

    await register();

    expect(mocks.getPayload).not.toHaveBeenCalled();
  });
});

describe('подъем при старте подключен в каждом приложении', () => {
  it('U6: список приложений берется из apps/ и не пуст', () => {
    expect(APPS).toContain('template');
    expect(APPS.length).toBeGreaterThan(1);
  });

  it.each(APPS)('U7: «%s» — src/instrumentation.ts реэкспортирует register ядра', async (app) => {
    const file = path.join(APPS_DIR, app, 'src/instrumentation.ts');

    expect(existsSync(file), `у приложения «${app}» нет ${file}: Next не поднимет Payload при старте`).toBe(true);

    const instrumentation = (await import(`../../apps/${app}/src/instrumentation.ts`)) as { register?: unknown };

    expect(instrumentation.register, `register в ${file} — не тот, что в @mrshkn/demo-core/instrumentation`).toBe(
      register,
    );
  });
});
