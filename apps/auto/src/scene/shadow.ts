// Контактная тень: мягкое пятно под кузовом и плотнее под колесами — машина стоит, а не висит в пустоте.
// Одна плоскость на земле, текстура рисуется на canvas радиальными градиентами (без ctx.filter: его нет в старых
// Safari). Сканер тень не режет: она не часть машины. В воркере DOM нет — там холст текстуры OffscreenCanvas.
import * as THREE from 'three';

const PX_PER_M = 40;
const SIZE = { x: 5.6, z: 2.8 };

type Blot = { x: number; z: number; rx: number; rz: number; alpha: number };

// Пятна в метрах (оси модели: +X — вперед, +Z — вправо): центр, полуоси, плотность в центре.
const BODY: Blot = { x: 0.02, z: 0, rx: 2.55, rz: 1.12, alpha: 0.55 };
const WHEELS: Blot[] = [-1.302, 1.302].flatMap((x) =>
  [-0.785, 0.785].map((z) => ({ x, z, rx: 0.42, rz: 0.2, alpha: 0.6 })),
);

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const blot = (ctx: Context2D, { x, z, rx, rz, alpha }: Blot) => {
  ctx.save();
  ctx.translate((x + SIZE.x / 2) * PX_PER_M, (z + SIZE.z / 2) * PX_PER_M);
  ctx.scale(rx * PX_PER_M, rz * PX_PER_M);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);

  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.55, `rgba(255, 255, 255, ${alpha * 0.55})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const createCanvas = (width: number, height: number) => {
  if (typeof document === 'undefined') {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
};

export const createContactShadow = (color: string) => {
  const canvas = createCanvas(SIZE.x * PX_PER_M, SIZE.z * PX_PER_M);
  const ctx = canvas.getContext('2d') as Context2D | null;

  if (ctx) {
    blot(ctx, BODY);
    WHEELS.forEach((wheel) => blot(ctx, wheel));
  }

  // Пятна белые по прозрачному: цвет тени дает color, плотность — альфа текстуры.
  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ color, map: texture, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SIZE.x, SIZE.z), material);

  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.001;
  mesh.renderOrder = -1;
  mesh.name = 'contact_shadow';

  return mesh;
};
