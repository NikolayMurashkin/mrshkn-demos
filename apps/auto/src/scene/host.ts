import { FILES } from './consts';
import type { SceneEvent, SceneFiles, SceneHost, SceneSetup } from './types';

/** Адреса статики от адреса страницы: воркер разрешает относительные пути от своего скрипта, а не от страницы. */
export const sceneFiles = (base: string): SceneFiles => ({
  model: new URL(FILES.model, base).href,
  env: new URL(FILES.env, base).href,
  box: new URL(FILES.box, base).href,
  transcoder: new URL(FILES.transcoder, base).href,
});

/** WebGL2 в главном потоке: проверка на временном холсте, контекст сразу отпускается. */
export const supportsWebgl2 = () => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');

    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    return Boolean(gl);
  } catch {
    return false;
  }
};

/**
 * Рендер в воркере: холст отдается воркеру (OffscreenCanvas), three и camera-controls в главный поток не попадают.
 * Воркер не запустился (скрипт не загрузился, ошибка до готовности сцены) — ответ `unsupported`, как и при отказе
 * WebGL: интерфейс перейдет к старту по действию. Ошибка после готовности сцену не останавливает и остается в консоли.
 */
export const startWorkerScene = (
  canvas: HTMLCanvasElement,
  setup: SceneSetup,
  onEvent: (event: SceneEvent) => void,
): SceneHost => {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker(new URL('./scene.worker.ts', import.meta.url), { type: 'module' });
  let ready = false;

  worker.addEventListener('message', (event: MessageEvent<SceneEvent>) => {
    ready ||= event.data.type === 'ready';
    onEvent(event.data);
  });
  worker.addEventListener('error', (event) => {
    if (!ready) {
      event.preventDefault();
      onEvent({ type: 'unsupported' });
    }
  });
  worker.postMessage({ type: 'init', canvas: offscreen, files: sceneFiles(location.href), ...setup }, [offscreen]);

  return {
    send: (command) => worker.postMessage(command),
    dispose: () => worker.terminate(),
  };
};

/** Рендер в главном потоке: те же модули сцены отдельным чанком, после первого действия посетителя. */
export const startMainScene = async (
  canvas: HTMLCanvasElement,
  setup: SceneSetup,
  onEvent: (event: SceneEvent) => void,
): Promise<SceneHost> => {
  const { createSceneRuntime } = await import('./runtime');
  const runtime = createSceneRuntime(onEvent);

  runtime.handle({ type: 'init', canvas, files: sceneFiles(location.href), ...setup });

  return { send: runtime.handle, dispose: runtime.dispose };
};
