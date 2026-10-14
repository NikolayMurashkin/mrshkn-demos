import type * as THREE from 'three';

export type StartMode = 'worker' | 'interaction';

export type StartEnv = {
  OffscreenCanvas?: new (width: number, height: number) => { getContext: (contextId: string) => unknown };
};

/** Пробный контекст проверки старта: расширение, которым его отпускают, есть не у каждой реализации. */
export type ProbeContext = {
  getExtension?: (name: 'WEBGL_lose_context') => { loseContext: () => void } | null;
};

/** Отметка режима сцены в DOM: постер (до старта, без WebGL, после сбоя), рендер в воркере или в главном потоке. */
export type SceneMode = 'poster' | 'worker' | 'main';

export type Vec3 = [number, number, number];

export type NodeView = { azimuth: number; polar: number; radius: number };

export type NodeFocus = { center: Vec3; radius: number; anchor?: Vec3 };

export type NodePlace = { anchor: Vec3; focus: NodeFocus; view: NodeView };

export type NodeSpec = NodePlace & {
  id: string;
  compact?: { anchor: Vec3; place?: string };
  places?: Record<string, NodePlace>;
};

export type Overview = {
  eye: Vec3;
  posters: { width: number; height: number; lens: number; target: Vec3 }[];
};

/** Цвета сцены — токены страницы: фон пленки, полоса сканера, срез, янтарь выбранного узла. */
export type SceneColors = { bg: string; xray: string; peak: string; cut: string; amber: string };

/** Адреса статики сцены: модель, HDRI, бокс и каталог транскодера KTX2. */
export type SceneFiles = { model: string; env: string; box: string; transcoder: string };

export type ScanUniforms = {
  uPlaneX: THREE.IUniform<number>;
  uSphere: THREE.IUniform<THREE.Vector4>;
  uSelected: THREE.IUniform<number>;
  uBandPeak: THREE.IUniform<THREE.Color>;
  uBandGlow: THREE.IUniform<THREE.Color>;
  uBandGain: THREE.IUniform<number>;
  uCut: THREE.IUniform<THREE.Color>;
};

/** Ряд хода кузова из расчета «четверти автомобиля»: шаг и смещения по шагам. */
export type RideCurve = { dt: number; body: Float64Array };

export type SuspensionRide = { front: RideCurve; rearDelay: number; speed: number; period: number };

/** Точка узла на экране сцены, пиксели CSS от левого верхнего угла холста. */
export type NodeAnchor = { id: string; place: string | null; x: number; y: number; visible: boolean };

export type PickHit = { id: string; place: string | null };

export type PickPurpose = 'select' | 'hover';

export type CanvasRect = { left: number; top: number; width: number; height: number };

/** Событие указателя, пересланное в воркер: только поля, которые читает camera-controls. */
export type ProxiedPointer = {
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';
  pointerId: number;
  pointerType: string;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  movementX: number;
  movementY: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  altKey: boolean;
};

/** Узел жестов: холст в главном потоке или прокси событий в воркере. */
export type GestureElement = EventTarget;

export type SceneOptions = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  element: GestureElement;
  colors: SceneColors;
  files: SceneFiles;
  /** Профиль телефона (`pointer: coarse`): DPR ≤ 1,5, MSAA ×2, без зеркала пола. */
  phone: boolean;
  reducedMotion?: boolean;
  onFrame?: (anchors: NodeAnchor[]) => void;
  onCycle?: (time: number) => void;
};

export type SceneSize = { width: number; height: number; pixelRatio: number; rect: CanvasRect };

export type SceneSetup = SceneSize & { colors: SceneColors; phone: boolean; reducedMotion: boolean };

/** Команды интерфейса сцене — одни и те же для воркера и главного потока. */
export type SceneCommand =
  | ({
      type: 'init';
      canvas: HTMLCanvasElement | OffscreenCanvas;
      colors: SceneColors;
      files: SceneFiles;
      phone: boolean;
      reducedMotion: boolean;
    } & SceneSize)
  | ({ type: 'resize' } & SceneSize)
  | { type: 'focus'; id: string; place: string | null }
  | { type: 'overview' }
  | { type: 'pick'; purpose: PickPurpose; x: number; y: number }
  | { type: 'suspension'; ride: SuspensionRide }
  | { type: 'chain'; lag: number }
  | { type: 'explainOff' }
  | { type: 'pointer'; event: ProxiedPointer; rect?: CanvasRect };

/** Ответы сцены интерфейсу. */
export type SceneEvent =
  | { type: 'ready'; samples: string }
  | { type: 'frame'; anchors: NodeAnchor[] }
  | { type: 'cycle'; time: number }
  | { type: 'picked'; purpose: PickPurpose; hit: PickHit | null }
  | { type: 'unsupported' }
  | { type: 'failed'; message: string };

/** Канал к сцене: команды туда, ответы — в onEvent, который передан при старте. */
export type SceneHost = {
  send: (command: SceneCommand) => void;
  dispose: () => void;
};
