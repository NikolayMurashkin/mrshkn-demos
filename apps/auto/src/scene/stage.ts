// Сцена «Сканер»: машина из auto.glb в краске, свет и отражения — от HDRI; сканер показывает «Снимок».
// Старт — кадр постера (перед снимком, корма в краске, фронт по средней стойке), фронт уходит к носу, в покое
// машина целиком в краске. Выбор узла — камера к узлу и сфера сканера вокруг него.
// Машина стоит в боксе сервиса (env.glb, грузится вторым файлом) на подъемнике: узлы снизу — тормоза, выхлоп, КПП —
// подъемник поднимает к камере. Подвеска остается на полу: ее объяснялка качает машину на кочке, колесам нужна дорога.
// DOM не трогает: работает и в воркере. Холст — обычный или OffscreenCanvas; жесты camera-controls слушает на element —
// самом холсте в главном потоке или прокси событий в воркере. Размер, указатель, профиль телефона и тексты дает UI.
// API: await createCarScene(options) → { focus(id, place), overview, pick → { id, place }, explainSuspension,
// explainChain, explainOff, resize, dispose, samples }; place — место разнесенного узла из NODE_SPECS.places
// (по умолчанию основное). options.onFrame(anchors) — точки узлов на экране после каждого кадра,
// options.onCycle(t) — время цикла объяснялки подвески, каждый кадр.
import CameraControls from 'camera-controls';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { loadBox, prepareBox, type PreparedBox } from './box';
import { createExplainers } from './explainers';
import { SceneUnsupportedError } from './errors';
import { createScanUniforms } from './materials';
import { createKtx2Loader, loadCar, prepareCar } from './model';
import { NODE_SPECS, OVERVIEW } from './nodes';
import { createContactShadow } from './shadow';
import type { NodeAnchor, PickHit, SceneOptions, SuspensionRide, Vec3 } from './types';

// camera-controls получает только нужные ему классы: весь неймспейс three в install() отключил бы tree-shaking.
CameraControls.install({
  THREE: {
    Box3: THREE.Box3,
    MathUtils: THREE.MathUtils,
    Matrix4: THREE.Matrix4,
    Quaternion: THREE.Quaternion,
    Raycaster: THREE.Raycaster,
    Sphere: THREE.Sphere,
    Spherical: THREE.Spherical,
    Vector2: THREE.Vector2,
    Vector3: THREE.Vector3,
    Vector4: THREE.Vector4,
  },
});

// Телефон: DPR ≤ 1,5, сглаживание дешевле. Bloom нет нигде: композер только переводит цвет в sRGB, как Standard
// у постера.
const PIXEL_RATIO = { phone: 1.5, desktop: 2 };
const MSAA = { phone: 2, desktop: 4 };
// Плотности «Снимка» × 0,35 — как у постера: вывод через OutputPass соответствует виду Standard в Blender.
const K_SCALE = 0.35;
const DIM_K = 0.35;
const OUTLINE_WIDTH = 0.0018;
const SENSOR_MM = 36;
// Сцена уже — точки узлов на общем плане из compact (телефон).
const COMPACT_WIDTH = 560;
// Фронт сканера по x: на постере — за средней стойкой, в покое — перед носом (машина целиком в краске).
const PLANE = { poster: -0.42, nose: 2.3, off: 100 };
const INTRO = { hold: 0.3, sweep: 1.5 };
// Сфера переезжает к новому месту, если оно рядом; дальше JUMP метров — закрывается и открывается на новом месте,
// иначе по пути прорезала бы салон.
// Скан при выборе: сфера ждет, пока камера долетит (wait ≈ smoothTime камеры), и раскрывается с полосой ярче в boost раз.
const SPHERE = { open: 0.5, close: 0.4, jump: 1, wait: 0.45, boost: 2.2 };
// Подъемник: узлы, которые смотрят снизу; подъем дольше полета камеры — камера прилетает раньше, машина въезжает
// в кадр. Пока машина поднята, камера может опуститься ниже горизонта (смотреть на днище).
const LIFT = { nodes: new Set(['brakes', 'exhaust', 'transmission']), duration: 1.1, maxPolar: 2.2 };
const MAX_POLAR = 1.62;
// Бокс уходит в темноту пленки: туман цвета фона по глубине кадра, метры. Туманится только бокс — у материалов машины
// туман выключен (камера на телефоне отъезжает до maxDistance); постер повторяет его в шейдерах бокса по глубине.
const FOG = { near: 6.5, far: 12 };
// Контактная тень с подъемом расплывается (×SPREAD на метр) и гаснет к FADE метрам; запеченная тень машины в полу
// остается — свет сверху машина закрывает и на подъемнике.
const SHADOW = { fade: 0.35, spread: 1.5 };
// Линия окон — доля высоты машины: выше нее кабина уже и короче кузова; зеркала — ниже, в объеме кузова.
const CAR_BELT = 0.76;
// Текстуры материалов GLB: material.dispose() их не освобождает.
const TEXTURE_SLOTS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'emissiveMap',
  'clearcoatNormalMap',
  'aoMap',
] as const;

type View = { azimuth: number; polar: number; radius: number };

type Spot = {
  place: string | null;
  anchor: THREE.Vector3;
  focusAnchor: THREE.Vector3;
  center: THREE.Vector3;
  radius: number;
  view: View;
};

type SceneNode = {
  index: number;
  spots: Spot[];
  compact: { anchor: THREE.Vector3; place: string | null } | null;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

// requestAnimationFrame есть и в воркере (Chrome, Firefox); где его нет — таймер на 60 к/с.
const nextFrame = (callback: FrameRequestCallback) =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(callback)
    : (setTimeout(() => callback(performance.now()), 16) as unknown as number);

const cancelFrame = (frame: number) =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(frame) : clearTimeout(frame);

const vector = (value: Vec3) => new THREE.Vector3(...value);

// Объемы машины для растворения бокса: кузов ниже линии окон и кабина над ней, по вершинам модели в покое.
const measureCar = (model: THREE.Object3D) => {
  model.updateWorldMatrix(true, true);
  const whole = new THREE.Box3().setFromObject(model);
  const belt = THREE.MathUtils.lerp(whole.min.y, whole.max.y, CAR_BELT);
  const body = new THREE.Box3();
  const cabin = new THREE.Box3();
  const point = new THREE.Vector3();

  model.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;
    const position = (object as THREE.Mesh).geometry.attributes.position;

    for (let index = 0; index < position.count; index++) {
      point.fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld);
      (point.y < belt ? body : cabin).expandByPoint(point);
    }
  });
  // объемы смыкаются по линии окон: между ними нет щели, куда предмет мог бы встать непрозрачным
  body.max.y = belt;
  cabin.min.y = belt;

  return { body, cabin };
};

export const createCarScene = async ({
  canvas,
  element,
  colors,
  files,
  phone,
  reducedMotion = false,
  onFrame = () => {},
  onCycle = () => {},
}: SceneOptions) => {
  let renderer: THREE.WebGLRenderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  } catch (error) {
    throw new SceneUnsupportedError(error);
  }

  renderer.toneMapping = THREE.NoToneMapping;
  const maxPixelRatio = phone ? PIXEL_RATIO.phone : PIXEL_RATIO.desktop;
  // Сэмплов цели не больше, чем дает устройство: на слабом телефоне MSAA урезают или нет совсем (тогда — дизеринг).
  const samples = Math.min(phone ? MSAA.phone : MSAA.desktop, renderer.capabilities.maxSamples);

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(colors.bg);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 60);

  const scan = createScanUniforms(colors);
  const nodeIds = NODE_SPECS.map(({ id }) => id);
  let model: THREE.Object3D;
  let env: THREE.DataTexture;
  let car: ReturnType<typeof prepareCar>;

  const ktx2 = createKtx2Loader(renderer, files);

  try {
    ({ model, env } = await loadCar(ktx2, files));
    car = prepareCar(model, { nodeIds, scan, colors, kScale: K_SCALE, dimK: DIM_K, outlineWidth: OUTLINE_WIDTH });
    // туман — только у бокса: машина не растворяется при отъезде камеры
    car.materials.forEach((material) => ((material as THREE.MeshStandardMaterial).fog = false));
  } catch (error) {
    // Модель не загрузилась или не по контракту — UI покажет постер; контекст WebGL не держим.
    ktx2.dispose();
    renderer.dispose();
    throw error;
  }

  // Подъемник двигает группу целиком; объяснялки двигают машину внутри нее.
  const rig = new THREE.Group();

  rig.name = 'car_rig';
  rig.add(model);
  scene.add(rig);
  // База и радиус колеса — по опорам колес в модели (центр колеса на высоте радиуса, колеса стоят на y = 0).
  const wheelFront = model.getObjectByName('wheel_fr')!.getWorldPosition(new THREE.Vector3());
  const wheelRear = model.getObjectByName('wheel_rr')!.getWorldPosition(new THREE.Vector3());
  const explainers = createExplainers(model, {
    snapshotMaterial: car.snapshotMaterial,
    wheelbase: wheelFront.x - wheelRear.x,
    wheelRadius: wheelFront.y,
    colors: { amber: colors.amber, xray: colors.xray },
  });
  // Объяснялка подвески: расчеты осей и время цикла; null — машина стоит.
  let ride: (SuspensionRide & { t: number }) | null = null;
  const shadow = createContactShadow(colors.cut);

  scene.add(shadow);

  // Карта окружения — результат рендера в цель: после потери контекста WebGL (телефон свернул браузер) ее содержимое
  // пропадает, а three заново заливает только ресурсы с данными в памяти. Поэтому исходник HDR остается в памяти
  // (1024 × 512, половинные float — 4 МиБ), карта собирается заново из него; копия исходника на видеокарте не нужна.
  const bakeEnvironment = () => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const target = pmrem.fromEquirectangular(env);

    env.dispose();
    pmrem.dispose();

    return target;
  };
  let envTarget = bakeEnvironment();

  scene.environment = envTarget.texture;

  const controls = new CameraControls(camera, element as HTMLElement);

  controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
  controls.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.mouseButtons.right = CameraControls.ACTION.NONE;
  controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
  controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
  controls.touches.three = CameraControls.ACTION.NONE;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = MAX_POLAR;
  controls.minDistance = 0.5;
  controls.maxDistance = 16;
  controls.smoothTime = reducedMotion ? 0 : 0.45;
  controls.draggingSmoothTime = 0.08;

  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples });
  const composer = new EffectComposer(renderer, target);

  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new OutputPass());

  // Место узла: точка выноски, сфера и ракурс; у разнесенного узла их несколько, основное — null. focus.anchor —
  // точка выноски выбранного узла, если с его ракурса точка общего плана не видна (выхлоп снизу).
  const spotOf = (
    place: string | null,
    { anchor, focus, view }: { anchor: Vec3; focus: { center: Vec3; radius: number; anchor?: Vec3 }; view: View },
  ): Spot => ({
    place,
    anchor: vector(anchor),
    focusAnchor: vector(focus.anchor ?? anchor),
    center: vector(focus.center),
    radius: focus.radius,
    view,
  });
  const nodes = new Map<string, SceneNode>(
    NODE_SPECS.map((spec, index) => {
      const spots = [
        spotOf(null, spec),
        ...Object.entries(spec.places ?? {}).map(([place, spot]) => spotOf(place, spot)),
      ];
      const compact = spec.compact ? { anchor: vector(spec.compact.anchor), place: spec.compact.place ?? null } : null;

      return [spec.id, { index, spots, compact }];
    }),
  );
  const spotFor = (node: SceneNode, place: string | null) =>
    node.spots.find((spot) => spot.place === place) ?? node.spots[0];

  const size = { width: 1, height: 1 };
  let active: string | null = null;
  let activeSpot: Spot | null = null;
  let sized = false;
  let needsRender = true;
  let introTime: number | null = 0;

  // Сфера сканера: центр и радиус плавно идут к цели; закрытая сфера снимает выбор.
  const sphere = {
    center: new THREE.Vector3(),
    radius: 0,
    from: { center: new THREE.Vector3(), radius: 0 },
    to: null as { center: THREE.Vector3; radius: number } | null,
    t: 1,
    duration: 1,
    wait: 0,
    opening: false,
  };
  // Подъем: высота машины и опоры lift_arm, метры; до загрузки бокса машина стоит.
  const lift = { y: 0, from: 0, to: 0, t: 1 };
  let box: PreparedBox | null = null;
  // Объемы машины в покое — кузов и кабина: бокс между камерой и ними гаснет; с подъемом едут вверх. Качание
  // объяснялки подвески — сантиметры, их покрывает мягкий край растворения.
  const carVolumes = measureCar(model);
  const liftedVolumes = { body: new THREE.Box3(), cabin: new THREE.Box3() };
  const lifted = new THREE.Vector3();
  const writeSphere = () =>
    scan.uSphere.value.set(sphere.center.x, sphere.center.y + lift.y, sphere.center.z, sphere.radius);
  const applyLift = () => {
    rig.position.y = lift.y;

    if (box) {
      box.liftArm.position.y = lift.y;
      lifted.set(0, lift.y, 0);
      liftedVolumes.body.copy(carVolumes.body).translate(lifted);
      liftedVolumes.cabin.copy(carVolumes.cabin).translate(lifted);
      box.setCar(liftedVolumes.body, liftedVolumes.cabin);
    }

    shadow.material.opacity = 1 - Math.min(lift.y / SHADOW.fade, 1);
    shadow.scale.setScalar(1 + lift.y * SHADOW.spread);
    shadow.visible = shadow.material.opacity > 0;
    controls.maxPolarAngle = lift.y > 0.5 ? LIFT.maxPolar : MAX_POLAR;
    writeSphere();
  };
  const liftTarget = () => (box && active && LIFT.nodes.has(active) ? box.liftMax : 0);
  const setLift = (to: number) => {
    if (to === lift.to) return false;
    lift.from = lift.y;
    lift.to = to;
    lift.t = reducedMotion ? 1 : 0;

    if (reducedMotion) {
      lift.y = to;
      applyLift();
    }

    needsRender = true;

    return true;
  };
  const stepLift = (dt: number) => {
    if (lift.t >= 1) return false;
    lift.t = Math.min(lift.t + dt / LIFT.duration, 1);
    lift.y = THREE.MathUtils.lerp(lift.from, lift.to, smooth(lift.t));
    applyLift();

    return true;
  };
  const setOutlines = (index: number, visible: boolean) =>
    car.outlines.get(index)?.forEach((mesh) => (mesh.visible = visible));

  const moveSphere = (center: THREE.Vector3, radius: number, duration: number) => {
    const reopen = radius > 0 && (sphere.radius === 0 || sphere.center.distanceTo(center) > SPHERE.jump);

    sphere.from.center.copy(reopen ? center : sphere.center);
    sphere.from.radius = reopen ? 0 : sphere.radius;
    sphere.to = { center: center.clone(), radius };
    sphere.duration = reducedMotion ? 0 : duration;
    sphere.wait = reopen && !reducedMotion ? SPHERE.wait : 0;
    sphere.opening = reopen;
    sphere.t = 0;
    needsRender = true;
  };

  const select = (node: SceneNode, spot: Spot) => {
    const previous = scan.uSelected.value;

    if (previous >= 0 && previous !== node.index) setOutlines(previous, false);
    scan.uSelected.value = node.index;
    setOutlines(node.index, true);
    moveSphere(spot.center, spot.radius, SPHERE.open);
  };

  const stepSphere = (dt: number) => {
    if (!sphere.to) return false;

    if (sphere.wait > 0) {
      sphere.wait -= dt;

      return true;
    }

    sphere.t = sphere.duration > 0 ? Math.min(sphere.t + dt / sphere.duration, 1) : 1;
    const k = smooth(sphere.t);

    scan.uBandGain.value = sphere.opening ? THREE.MathUtils.lerp(SPHERE.boost, 1, sphere.t) : 1;
    sphere.center.lerpVectors(sphere.from.center, sphere.to.center, k);
    sphere.radius = THREE.MathUtils.lerp(sphere.from.radius, sphere.to.radius, k);

    if (sphere.t >= 1) {
      sphere.to = null;

      if (sphere.radius === 0 && !active) {
        setOutlines(scan.uSelected.value, false);
        scan.uSelected.value = -1;
      }
    }

    writeSphere();

    return true;
  };

  // Хореография старта: кадр постера, пауза, фронт уходит к носу; дальше плоскость выключена.
  const stepIntro = (dt: number) => {
    if (introTime === null) return false;
    introTime += dt;

    if (introTime < INTRO.hold) {
      scan.uPlaneX.value = PLANE.poster;

      return true;
    }

    const t = reducedMotion ? 1 : Math.min((introTime - INTRO.hold) / INTRO.sweep, 1);

    scan.uPlaneX.value = t < 1 ? THREE.MathUtils.lerp(PLANE.poster, PLANE.nose, smooth(t)) : PLANE.off;
    if (t >= 1) introTime = null;

    return true;
  };

  scan.uPlaneX.value = PLANE.poster;

  const updateSnapshots = () => {
    const visible = scan.uPlaneX.value < PLANE.off || sphere.radius > 0;

    car.snapshots.forEach((mesh) => (mesh.visible = visible));
  };

  // Кадр общего плана: горизонтальный угол и точка взгляда идут по пропорции кадра между двумя постерами, на их
  // размерах кадр совпадает с постером точно. Угол постера — объектив Blender, окно 36 мм по длинной стороне.
  const posterFrames = OVERVIEW.posters.map(({ width, height, lens, target: look }) => {
    const aspect = width / height;
    const half = Math.atan(SENSOR_MM / 2 / lens);

    return {
      aspect,
      target: vector(look),
      halfWidth: aspect >= 1 ? half : Math.atan(Math.tan(half) * aspect),
    };
  });
  const overviewTarget = new THREE.Vector3();
  const applyLens = () => {
    const aspect = size.width / size.height;
    const [narrow, wide] = posterFrames;
    const t = THREE.MathUtils.clamp((aspect - narrow.aspect) / (wide.aspect - narrow.aspect), 0, 1);
    const halfWidth = THREE.MathUtils.lerp(narrow.halfWidth, wide.halfWidth, t);

    overviewTarget.lerpVectors(narrow.target, wide.target, t);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfWidth) / aspect));
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  const fitDistance = (radius: number) => {
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);

    return radius / Math.sin(Math.min(vertical, horizontal) / 2);
  };

  const showOverview = (animate: boolean) => {
    const [x, y, z] = OVERVIEW.eye;

    controls.setLookAt(x, y, z, overviewTarget.x, overviewTarget.y, overviewTarget.z, animate);
    needsRender = true;
  };

  // Перелет к узлу кратчайшим поворотом: азимут приводится к ближайшему от текущего. Цель — узел на той высоте,
  // куда едет подъемник.
  const showSpot = ({ view, center }: Spot, animate: boolean) => {
    const turn = Math.PI * 2;
    const azimuth = view.azimuth + Math.round((controls.azimuthAngle - view.azimuth) / turn) * turn;

    if (view.polar > MAX_POLAR) controls.maxPolarAngle = LIFT.maxPolar;
    controls.rotateTo(azimuth, view.polar, animate);
    controls.moveTo(center.x, center.y + lift.to, center.z, animate);
    controls.dollyTo(fitDistance(view.radius), animate);
    needsRender = true;
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  // Узел под указателем и его место: у разнесенного узла — место с ближайшим к точке попадания центром сферы.
  const pick = (x: number, y: number): PickHit | null => {
    pointer.set((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(car.pickables, false)[0];
    const id: string | null | undefined = hit?.object.userData.nodeId;

    if (!hit || !id) return null;
    const point = hit.point.clone().setY(hit.point.y - lift.y);
    const nearest = nodes
      .get(id)!
      .spots.reduce((best, spot) =>
        spot.center.distanceToSquared(point) < best.center.distanceToSquared(point) ? spot : best,
      );

    return { id, place: nearest.place };
  };

  const projected = new THREE.Vector3();
  const emitFrame = () => {
    const narrow = size.width < COMPACT_WIDTH;
    const anchors: NodeAnchor[] = [...nodes].map(([id, node]) => {
      const point =
        id === active && activeSpot
          ? { anchor: activeSpot.focusAnchor, place: activeSpot.place }
          : narrow && node.compact
            ? node.compact
            : { anchor: node.spots[0].anchor, place: null };

      projected.copy(point.anchor);
      projected.y += lift.y;
      projected.project(camera);

      return {
        id,
        place: point.place,
        x: ((projected.x + 1) / 2) * size.width,
        y: ((1 - projected.y) / 2) * size.height,
        visible: projected.z < 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1,
      };
    });

    onFrame(anchors);
  };

  const draw = () => {
    updateSnapshots();
    composer.render();
    emitFrame();
    needsRender = false;
  };

  // Браузер может сбросить WebGL-контекст; three восстанавливает его сам (его обработчик стоит раньше этого), карту
  // окружения собираем заново, кадр перерисовываем. Старую цель не освобождаем: ее память ушла вместе с контекстом,
  // а dispose() удалял бы объекты прошлого контекста — WebGL пишет об этом предупреждения в консоль.
  const onContextRestored = () => {
    envTarget = bakeEnvironment();
    scene.environment = envTarget.texture;
    needsRender = true;
  };

  canvas.addEventListener('webglcontextrestored', onContextRestored);

  // Цикл подвески: кочка, качание, пауза — и снова; при reducedMotion машина стоит, меняется только график.
  const stepRide = (dt: number) => {
    if (!ride || reducedMotion) return false;
    ride.t = (ride.t + dt) % ride.period;
    explainers.suspension(ride, ride.t);
    onCycle(ride.t);

    return true;
  };

  const timer = new THREE.Timer();
  let frame = 0;
  const tick = (time: number) => {
    frame = nextFrame(tick);
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.1);

    if (!sized) return;
    const moved = controls.update(dt);
    const introducing = stepIntro(dt);
    const opening = stepSphere(dt);
    const riding = stepRide(dt);
    const lifting = stepLift(dt);

    if (moved || introducing || opening || riding || lifting || needsRender) draw();
  };

  frame = nextFrame(tick);

  // Бокс — вторым файлом, после машины; сцена отдается, когда загружены оба: первый кадр совпадает с постером, где
  // машина стоит в боксе. Бокс не загрузился — машина стоит на фоне пленки, в консоли одна ошибка.
  try {
    const root = await loadBox(ktx2, files);

    box = prepareBox(root, { mirror: !phone, samples });
    scene.add(root);
    applyLift();
    scene.fog = new THREE.Fog(colors.bg, FOG.near, FOG.far);
  } catch (error) {
    console.error(`Бокс сервиса не загрузился (${files.box}), машина остается на фоне пленки.`, error);
  } finally {
    ktx2.dispose();
  }

  return {
    /** Сэмплы MSAA цели рендера и предел устройства: «4/4», без MSAA — «0/0». */
    samples: `${target.samples}/${renderer.capabilities.maxSamples}`,
    focus(id: string, place: string | null = null) {
      const node = nodes.get(id);

      if (!node) return;
      active = id;
      activeSpot = spotFor(node, place);
      select(node, activeSpot);
      setLift(liftTarget());
      showSpot(activeSpot, !reducedMotion);
    },
    overview() {
      active = null;
      moveSphere(sphere.center, 0, SPHERE.close);
      setLift(0);
      showOverview(!reducedMotion);
    },
    pick,
    // front — расчет передней оси (physics/quarter-car simulate), rearDelay — на сколько позже задняя ось
    // проходит ту же кочку, с; speed — м/с, period — длина цикла, с. Новый расчет при движении ползунка не сбрасывает
    // время цикла.
    explainSuspension({ front, rearDelay, speed, period }: SuspensionRide) {
      ride = { front, rearDelay, speed, period, t: ride ? ride.t % period : 0 };
      needsRender = true;
    },
    // lag — отставание распредвала, радианы распредвала.
    explainChain(lag: number) {
      explainers.chain(lag);
      needsRender = true;
    },
    explainOff() {
      ride = null;
      explainers.rest();
      needsRender = true;
    },
    resize(width: number, height: number, pixelRatio = 1) {
      size.width = Math.max(1, Math.round(width));
      size.height = Math.max(1, Math.round(height));
      const ratio = Math.min(pixelRatio, maxPixelRatio);

      renderer.setPixelRatio(ratio);
      renderer.setSize(size.width, size.height, false);
      composer.setPixelRatio(ratio);
      composer.setSize(size.width, size.height);
      box?.resize(size.width * ratio, size.height * ratio);
      applyLens();
      // Поворот, который сделал посетитель, ресайз не сбрасывает: меняется только угол объектива и расстояние до узла.
      if (active && activeSpot) controls.dollyTo(fitDistance(activeSpot.view.radius), false);
      else if (!sized) showOverview(false);
      sized = true;
      // Новый размер очищает холст: кадр рисуется сразу, а не в следующем requestAnimationFrame — иначе пустой кадр.
      controls.update(0);
      draw();
    },
    dispose() {
      cancelFrame(frame);
      box?.dispose();
      explainers.dispose();
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      composer.dispose();
      scene.traverse((object) => (object as THREE.Mesh).geometry?.dispose());
      car.materials.forEach((material) => {
        TEXTURE_SLOTS.forEach((slot) => (material as THREE.MeshPhysicalMaterial)[slot]?.dispose());
        material.dispose();
      });
      shadow.material.map?.dispose();
      shadow.material.dispose();
      envTarget.dispose();
      renderer.dispose();
    },
  };
};

export type CarScene = Awaited<ReturnType<typeof createCarScene>>;
