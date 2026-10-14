import { createSceneRuntime } from './runtime';
import type { SceneCommand } from './types';

// Рендер сцены в воркере: холст передан из главного потока (OffscreenCanvas), команды и ответы — сообщениями.
const runtime = createSceneRuntime((event) => self.postMessage(event));

self.addEventListener('message', (event: MessageEvent<SceneCommand>) => runtime.handle(event.data));
