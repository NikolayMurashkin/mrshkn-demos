import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickStartMode, waitForFirstAction } from '../../apps/auto/src/scene/start';

type Env = Parameters<typeof pickStartMode>[0];

const AUTO_SRC = path.resolve(import.meta.dirname, '../../apps/auto/src');

/** Окружение, где `new OffscreenCanvas(1, 1).getContext(kind)` дает контекст только для видов из `supported`. */
const canvasEnv = (supported: string[]) => {
  const asked: string[] = [];

  class FakeOffscreenCanvas {
    constructor(
      readonly width: number,
      readonly height: number,
    ) {}

    getContext(kind: string) {
      asked.push(kind);

      return supported.includes(kind) ? { kind } : null;
    }
  }

  return { env: { OffscreenCanvas: FakeOffscreenCanvas } as Env, asked };
};

const webgl2Env = () => canvasEnv(['webgl2', 'webgl']).env;

const noCanvasEnv = () => ({}) as Env;

/** Разрешен ли промис к моменту, когда прошли все микрозадачи и таймер 0. */
const settled = (promise: Promise<unknown>) =>
  Promise.race([
    promise.then(() => 'resolved' as const),
    new Promise<'pending'>((resolve) => setTimeout(() => resolve('pending'), 0)),
  ]);

/**
 * EventTarget, который считает слушателей: каждый слушатель обернут, обертка отмечает вызов. Активные слушатели —
 * те, чьи обертки еще срабатывают на событие: так учитываются и `removeEventListener`, и `once`, и `signal`.
 */
class CountingTarget extends EventTarget {
  readonly added: string[] = [];

  private calls = 0;

  private wrappers = new Map<EventListenerOrEventListenerObject, Map<string, EventListener>>();

  private wrapperFor(type: string, listener: EventListenerOrEventListenerObject, capture: boolean) {
    const byKey = this.wrappers.get(listener) ?? new Map<string, EventListener>();
    const key = `${type}:${capture}`;

    this.wrappers.set(listener, byKey);

    if (!byKey.has(key)) {
      byKey.set(key, (event) => {
        this.calls += 1;

        if (typeof listener === 'function') {
          listener.call(this, event);
        } else {
          listener.handleEvent(event);
        }
      });
    }

    return byKey.get(key) as EventListener;
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (!listener) {
      return;
    }

    const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);

    this.added.push(type);
    super.addEventListener(type, this.wrapperFor(type, listener, capture), options);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) {
    if (!listener) {
      return;
    }

    const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);

    super.removeEventListener(type, this.wrapperFor(type, listener, capture), options);
  }

  /** Сколько слушателей, повешенных на `types`, еще отвечают: шлет каждое событие и считает вызовы оберток. */
  active(types: string[]) {
    const before = this.calls;

    types.forEach((type) => this.dispatchEvent(new Event(type)));

    return this.calls - before;
  }
}

const ACTIONS = ['touchstart', 'click', 'scroll'];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('выбор режима старта сцены', () => {
  it('M1: OffscreenCanvas с WebGL2 → воркер; спрошен именно webgl2', () => {
    const { env, asked } = canvasEnv(['webgl2', 'webgl']);

    expect(pickStartMode(env)).toBe('worker');
    expect(asked).toEqual(['webgl2']);
  });

  it('M2: нет OffscreenCanvas → ожидание первого действия', () => {
    expect(pickStartMode(noCanvasEnv())).toBe('interaction');
  });

  it('M3: OffscreenCanvas без WebGL2 (только WebGL1) → ожидание первого действия', () => {
    const { env } = canvasEnv(['webgl']);

    expect(pickStartMode(env)).toBe('interaction');
  });

  it('M4: конструктор OffscreenCanvas или getContext бросает → ожидание первого действия, без исключения', () => {
    class ThrowingConstructor {
      constructor() {
        throw new Error('OffscreenCanvas недоступен');
      }

      getContext() {
        return null;
      }
    }

    class ThrowingContext {
      getContext(): unknown {
        throw new Error('getContext недоступен');
      }
    }

    const modes: string[] = [];

    expect(() => {
      modes.push(pickStartMode({ OffscreenCanvas: ThrowingConstructor } as unknown as Env));
      modes.push(pickStartMode({ OffscreenCanvas: ThrowingContext } as unknown as Env));
    }).not.toThrow();
    expect(modes).toEqual(['interaction', 'interaction']);
  });
});

describe('код старта не читает User-Agent', () => {
  it('U1: с navigator-ловушкой на userAgent и userAgentData старт работает так же, ловушка не сработала', async () => {
    let reads = 0;
    const trap = {};

    ['userAgent', 'userAgentData'].forEach((key) =>
      Object.defineProperty(trap, key, {
        get() {
          reads += 1;
          throw new Error(`код старта читает navigator.${key}`);
        },
      }),
    );
    vi.stubGlobal('navigator', trap);

    const modes: string[] = [];
    const target = new EventTarget();
    let waiting: Promise<void> | undefined;

    expect(() => {
      modes.push(pickStartMode(webgl2Env()));
      modes.push(pickStartMode(noCanvasEnv()));
      waiting = waitForFirstAction(target);
    }).not.toThrow();
    expect(modes).toEqual(['worker', 'interaction']);

    target.dispatchEvent(new Event('click'));

    expect(await settled(waiting ?? Promise.reject(new Error('waitForFirstAction не вернул промис')))).toBe('resolved');
    expect(reads).toBe(0);
  });

  it('U2: в исходниках apps/auto/src нет обращения к userAgent', () => {
    const sources = (directory: string): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          return sources(full);
        }

        return /\.(ts|tsx|js)$/.test(entry.name) ? [full] : [];
      });

    const files = sources(AUTO_SRC);
    const offenders = files
      .filter((file) => readFileSync(file, 'utf8').includes('userAgent'))
      .map((file) => path.relative(AUTO_SRC, file));

    expect(files.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});

describe('ожидание первого действия', () => {
  it.each(ACTIONS)('W1: событие %s разрешает ожидание', async (type) => {
    const target = new EventTarget();
    const waiting = waitForFirstAction(target);

    target.dispatchEvent(new Event(type));

    expect(await settled(waiting)).toBe('resolved');
  });

  it('W2: без касания, клика и прокрутки (и после mousemove) ожидание не разрешено', async () => {
    const target = new EventTarget();
    const waiting = waitForFirstAction(target);

    expect(await settled(waiting)).toBe('pending');

    target.dispatchEvent(new Event('mousemove'));

    expect(await settled(waiting)).toBe('pending');
  });

  it('W3: после разрешения все слушатели ожидания сняты', async () => {
    const target = new CountingTarget();
    const waiting = waitForFirstAction(target);

    target.dispatchEvent(new Event('click'));

    expect(await settled(waiting)).toBe('resolved');
    expect(target.active([...new Set([...ACTIONS, ...target.added])])).toBe(0);
  });
});
