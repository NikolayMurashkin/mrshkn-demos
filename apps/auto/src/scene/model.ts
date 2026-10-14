// Модель машины: GLB (Meshopt + KTX2) и HDRI окружения, подготовка к виду «Сканер».
// Статичные сетки сливаются по материалу (меньше вызовов отрисовки на слабом телефоне), движущиеся части из
// CONTRACT.md остаются живыми объектами GLB: их опоры двигает только код объяснялок.
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createOutlineMaterial, createSnapshotMaterial, patchPaintMaterial } from './materials';
import { SceneLoadError } from './errors';
import type { ScanUniforms, SceneColors, SceneFiles } from './types';

const MOVING = /^(sprocket_(crank|cam)|spring_[fr][lr]|damper_rod_[fr][lr]|wheel_[fr][lr])$/;
const NODE_PREFIX = 'node_';
// Стекла фар и фонарей в GLB — с пропусканием (KHR_materials_transmission): в three это еще один проход сцены
// в текстуру, на телефоне дорого. Вместо него — полупрозрачность.
const LENS_OPACITY = 0.4;
// Узлы под капотом в жизни в тени кузова. Запеченное затенение (aoMap) гасит окружение в щелях между деталями,
// но тени кузова в нем нет (в сфере сканера кузов вырезан): металл узла без поправки светлее, чем под капотом.
// Материалам, которые есть только в узлах, отражения окружения — слабее.
const NODE_ENV_INTENSITY = 0.8;

/** Материал GLB: PBR со всеми картами, которые трогает сцена. */
type GlbMaterial = THREE.MeshPhysicalMaterial;

// Загрузка с именем файла в ошибке: посетитель видит постер, а в консоли — какой файл не дошел.
const named = <T>(file: string, loading: Promise<T>) =>
  loading.catch((error: unknown) => {
    throw new SceneLoadError(file, error);
  });

// Один загрузчик KTX2 на машину и бокс: каждый экземпляр сам качает транскодер и держит свой пул воркеров.
export const createKtx2Loader = (renderer: THREE.WebGLRenderer, files: SceneFiles) =>
  new KTX2Loader().setTranscoderPath(files.transcoder).detectSupport(renderer);

export const loadCar = async (ktx2: KTX2Loader, files: SceneFiles) => {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx2);
  const [gltf, env] = await Promise.all([
    named(files.model, loader.loadAsync(files.model)),
    named(files.env, new HDRLoader().loadAsync(files.env)),
  ]);

  return { model: gltf.scene, env };
};

const ancestor = (object: THREE.Object3D, test: (node: THREE.Object3D) => boolean) => {
  for (let node: THREE.Object3D | null = object; node; node = node.parent) if (test(node)) return node;

  return null;
};

const xrayK = (mesh: THREE.Mesh) => {
  const k = mesh.userData.xray_k ?? mesh.parent?.userData.xray_k;

  if (typeof k !== 'number') throw new Error(`У сетки ${mesh.name} нет extras.xray_k`);

  return k;
};

const constantAttribute = (count: number, value: number) =>
  new THREE.BufferAttribute(new Float32Array(count).fill(value), 1);

type AnyAttribute = THREE.BufferAttribute | THREE.InterleavedBufferAttribute;

// Сжатые атрибуты (KHR_mesh_quantization: нормализованные целые) — в Float32: иначе геометрии не слить.
const toFloat = (attribute: AnyAttribute) => {
  const { count, itemSize } = attribute;
  const array = new Float32Array(count * itemSize);
  const read = [attribute.getX, attribute.getY, attribute.getZ, attribute.getW].slice(0, itemSize);

  for (let i = 0; i < count; i++) read.forEach((get, c) => (array[i * itemSize + c] = get.call(attribute, i)));

  return new THREE.BufferAttribute(array, itemSize);
};

// Геометрия сетки в мировых координатах с атрибутами вида «Сканер».
const worldGeometry = (mesh: THREE.Mesh, names: string[], extra: Record<string, number>) => {
  const geometry = new THREE.BufferGeometry();
  const source = mesh.geometry;

  names.forEach((name) => {
    const attribute = source.getAttribute(name);

    geometry.setAttribute(
      name,
      attribute
        ? toFloat(attribute)
        : new THREE.BufferAttribute(new Float32Array(source.getAttribute('position').count * 2), 2),
    );
  });
  geometry.setIndex(source.index ? source.index.clone() : null);
  geometry.applyMatrix4(mesh.matrixWorld);
  const count = geometry.getAttribute('position').count;

  Object.entries(extra).forEach(([name, value]) => geometry.setAttribute(name, constantAttribute(count, value)));

  return geometry;
};

const merge = (geometries: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(geometries, false);

  if (!merged) throw new Error('Геометрии модели не слились');
  geometries.forEach((geometry) => geometry.dispose());

  return merged;
};

const fixLens = (material: GlbMaterial) => {
  if (!material.transmission) return;
  material.transmission = 0;
  material.transparent = true;
  material.opacity = LENS_OPACITY;
  material.depthWrite = false;
};

type PrepareCarOptions = {
  nodeIds: string[];
  scan: ScanUniforms;
  colors: SceneColors;
  kScale: number;
  dimK: number;
  outlineWidth: number;
};

// model — сцена GLB; nodeIds — порядок узлов (индекс узла = индекс в списке).
// Возвращает пикабельные сетки узлов, снимки, контуры по индексу узла и материал снимка (для «тени» объяснялки).
export const prepareCar = (
  model: THREE.Object3D,
  { nodeIds, scan, colors, kScale, dimK, outlineWidth }: PrepareCarOptions,
) => {
  model.updateMatrixWorld(true);
  const snapshotMaterial = createSnapshotMaterial(scan, { kScale, dimK });
  const outlineMaterial = createOutlineMaterial(scan, colors.amber, outlineWidth);
  const paintGroups = new Map<
    string,
    { material: GlbMaterial; needsUv: boolean; geometries: THREE.BufferGeometry[] }
  >();
  const shellSnapshots: THREE.BufferGeometry[] = [];
  const nodeSnapshots: THREE.BufferGeometry[] = [];
  const nodeOutlines = new Map<number, THREE.BufferGeometry[]>(nodeIds.map((_, index) => [index, []]));
  const outlines = new Map<number, THREE.Mesh[]>(nodeIds.map((_, index) => [index, []]));
  const snapshots: THREE.Mesh[] = [];
  const pickables: THREE.Mesh[] = [];
  const patched = new Set<GlbMaterial>();
  const meshes: THREE.Mesh[] = [];

  model.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh);
  });
  const isNodePart = (object: THREE.Object3D) => Boolean(ancestor(object, (node) => node.name.startsWith(NODE_PREFIX)));
  const shellMaterials = new Set(meshes.filter((mesh) => !isNodePart(mesh)).map((mesh) => mesh.material));

  meshes.forEach((mesh) => {
    const material = mesh.material as GlbMaterial;

    if (!patched.has(material)) {
      fixLens(material);
      if (!shellMaterials.has(material)) material.envMapIntensity = NODE_ENV_INTENSITY;
      patchPaintMaterial(material, scan);
      patched.add(material);
    }

    const nodeRoot = ancestor(mesh, (node) => node.name.startsWith(NODE_PREFIX));
    const nodeIndex = nodeRoot ? nodeIds.indexOf(nodeRoot.name.slice(NODE_PREFIX.length)) : -1;

    if (nodeRoot && nodeIndex < 0) throw new Error(`Узла ${nodeRoot.name} нет в списке узлов сцены`);
    mesh.userData.nodeId = nodeRoot ? nodeIds[nodeIndex] : null;
    const k = xrayK(mesh);

    if (nodeRoot) pickables.push(mesh);

    if (ancestor(mesh, (node) => MOVING.test(node.name))) {
      // Живая часть: атрибуты вида на ее же геометрии, снимок и контур — соседи с тем же трансформом.
      const count = mesh.geometry.getAttribute('position').count;

      mesh.geometry.setAttribute('nodeIndex', constantAttribute(count, nodeIndex));
      mesh.geometry.setAttribute('xrayK', constantAttribute(count, k));
      const twin = (twinMaterial: THREE.Material) => {
        const copy = new THREE.Mesh(mesh.geometry, twinMaterial);

        copy.position.copy(mesh.position);
        copy.quaternion.copy(mesh.quaternion);
        copy.scale.copy(mesh.scale);
        mesh.parent?.add(copy);

        return copy;
      };
      const snapshot = twin(snapshotMaterial);

      snapshot.renderOrder = 1;
      snapshots.push(snapshot);

      if (nodeRoot) {
        const outline = twin(outlineMaterial);

        outline.visible = false;
        outlines.get(nodeIndex)?.push(outline);
      }

      return;
    }

    const names = ['position', 'normal'];
    const needsUv = Boolean(material.map || material.normalMap || material.roughnessMap || material.metalnessMap);
    const key = material.uuid;

    if (!paintGroups.has(key)) paintGroups.set(key, { material, needsUv, geometries: [] });
    const group = paintGroups.get(key)!;
    // вторая развертка — затенение узлов (aoMap по TEXCOORD_1, CONTRACT.md)
    const uvNames = [...(group.needsUv ? ['uv'] : []), ...(material.aoMap ? ['uv1'] : [])];

    group.geometries.push(worldGeometry(mesh, [...names, ...uvNames], { nodeIndex, xrayK: k }));
    const snapshotGeometry = worldGeometry(mesh, names, { nodeIndex, xrayK: k });

    if (nodeRoot) {
      nodeSnapshots.push(snapshotGeometry);
      nodeOutlines.get(nodeIndex)?.push(worldGeometry(mesh, names, {}));
    } else shellSnapshots.push(snapshotGeometry);
    // Исходная сетка остается для выбора лучом (узлы), но не рисуется.
    mesh.visible = false;
  });

  paintGroups.forEach(({ material, geometries }) => {
    const mesh = new THREE.Mesh(merge(geometries), material);

    mesh.name = `paint_${material.name}`;
    model.add(mesh);
  });
  [shellSnapshots, nodeSnapshots].forEach((geometries, i) => {
    const mesh = new THREE.Mesh(merge(geometries), snapshotMaterial);

    mesh.name = i ? 'snapshot_nodes' : 'snapshot_shell';
    mesh.renderOrder = 1;
    model.add(mesh);
    snapshots.push(mesh);
  });
  nodeOutlines.forEach((geometries, index) => {
    const mesh = new THREE.Mesh(merge(geometries), outlineMaterial);

    mesh.name = `outline_${nodeIds[index]}`;
    mesh.visible = false;
    model.add(mesh);
    outlines.get(index)?.push(mesh);
  });

  return {
    pickables,
    snapshots,
    outlines,
    snapshotMaterial,
    materials: [...patched, snapshotMaterial, outlineMaterial] as THREE.Material[],
  };
};
