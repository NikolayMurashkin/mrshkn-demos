import type { ProbeContext, StartEnv, StartMode } from './types';

/** События, после которых сцена без OffscreenCanvas стартует в главном потоке. */
export const FIRST_ACTIONS = ['touchstart', 'click', 'scroll'] as const;

/**
 * Режим старта: OffscreenCanvas с WebGL2 → рендер в воркере сразу после загрузки страницы, иначе — по первому
 * действию посетителя. Решает только поддержка API: строка браузера не читается, и Lighthouse не отличить от человека.
 * Любая ошибка проверки — тот же запасной режим.
 */
export const pickStartMode = (env: StartEnv = globalThis as StartEnv): StartMode => {
  try {
    const { OffscreenCanvas } = env;

    if (!OffscreenCanvas) {
      return 'interaction';
    }

    const gl = new OffscreenCanvas(1, 1).getContext('webgl2') as ProbeContext | null;

    // пробный контекст отпускается сразу: иначе он живет до сборки мусора рядом с контекстом воркера
    gl?.getExtension?.('WEBGL_lose_context')?.loseContext();

    return gl ? 'worker' : 'interaction';
  } catch {
    return 'interaction';
  }
};

/** Первое касание, клик или прокрутка на `target`; после него слушатели сняты. */
export const waitForFirstAction = (target: EventTarget): Promise<void> =>
  new Promise((resolve) => {
    const options = { capture: true, passive: true };
    const done = () => {
      FIRST_ACTIONS.forEach((type) => target.removeEventListener(type, done, options));
      resolve();
    };

    FIRST_ACTIONS.forEach((type) => target.addEventListener(type, done, options));
  });
