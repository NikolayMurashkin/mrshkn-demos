import { ElementProxy } from './element-proxy';
import { SceneLoadError, SceneUnsupportedError } from './errors';
import { createCarScene, type CarScene } from './stage';
import type { SceneCommand, SceneEvent, SceneSize } from './types';

/**
 * Сцена за протоколом сообщений: одни и те же команды и ответы в воркере (postMessage) и в главном потоке (вызов
 * функции). Команды до готовности сцены, кроме размера, не копятся: интерфейс повторит выбор и объяснялку после
 * `ready`.
 */
export const createSceneRuntime = (post: (event: SceneEvent) => void) => {
  let scene: CarScene | null = null;
  let proxy: ElementProxy | null = null;
  let size: SceneSize | null = null;
  let disposed = false;

  const applySize = () => {
    if (scene && size) {
      scene.resize(size.width, size.height, size.pixelRatio);
    }
  };

  const init = async (command: Extract<SceneCommand, { type: 'init' }>) => {
    const { canvas, colors, files, phone, reducedMotion, ...initial } = command;
    const offscreen = typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas;

    size = initial;
    proxy = offscreen ? new ElementProxy(initial.rect) : null;

    try {
      const created = await createCarScene({
        canvas,
        element: proxy ?? canvas,
        colors,
        files,
        phone,
        reducedMotion,
        onFrame: (anchors) => post({ type: 'frame', anchors }),
        onCycle: (time) => post({ type: 'cycle', time }),
      });

      if (disposed) {
        created.dispose();

        return;
      }

      scene = created;
    } catch (error) {
      if (error instanceof SceneUnsupportedError) {
        post({ type: 'unsupported' });
      } else {
        post({
          type: 'failed',
          message: error instanceof SceneLoadError ? error.message : `3D-сцена не запустилась: ${String(error)}`,
        });
      }

      return;
    }

    applySize();
    post({ type: 'ready', samples: scene.samples });
  };

  const handle = (command: SceneCommand) => {
    switch (command.type) {
      case 'init':
        void init(command);
        break;
      case 'resize':
        size = command;
        proxy?.setRect(command.rect);
        applySize();
        break;
      case 'pointer':
        if (command.rect) proxy?.setRect(command.rect);
        proxy?.dispatchPointer(command.event);
        break;
      case 'focus':
        scene?.focus(command.id, command.place);
        break;
      case 'overview':
        scene?.overview();
        break;
      case 'pick':
        if (scene) post({ type: 'picked', purpose: command.purpose, hit: scene.pick(command.x, command.y) });
        break;
      case 'suspension':
        scene?.explainSuspension(command.ride);
        break;
      case 'chain':
        scene?.explainChain(command.lag);
        break;
      case 'explainOff':
        scene?.explainOff();
        break;
    }
  };

  const dispose = () => {
    disposed = true;
    scene?.dispose();
    scene = null;
  };

  return { handle, dispose };
};
