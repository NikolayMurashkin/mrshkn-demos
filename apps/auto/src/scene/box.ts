// Бокс сервиса вокруг машины: env.glb (Meshopt + KTX2), грузится вторым файлом, после машины.
// Статичный бокс не освещается в реальном времени: его вид — запеченный свет в карте излучения, цвет материала
// черный (CONTRACT.md, «Бокс»). Отражения окружения у него выключены, кроме пола: бетон отражает HDRI, а на
// десктопе — еще и машину (плоское зеркало в половинном разрешении, сложением поверх пола). Сканер бокс не режет.
// Подвижная часть подъемника — опора lift_arm: обычный PBR, высоту задает сцена.
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { SceneLoadError } from './errors';
import type { SceneFiles } from './types';

// Отражения HDRI у пола: бетон шероховатый, блик ламп окружения — пятном, не зеркалом.
const FLOOR_ENV_INTENSITY = 0.35;
// Зеркало пола: доля отражения, радиус, за которым отражение гаснет (м от середины поста), разрешение — доля холста.
const MIRROR = { strength: 0.16, fade: [2.2, 4.2] as const, scale: 0.5 };
const TEXTURE_SLOTS = ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap'] as const;
// Бокс не закрывает машину: фрагмент, через который луч из камеры идет в объем машины и который ближе дальней грани
// объема, гаснет до alpha. Объемов два — кузов ниже линии окон и кабина над ним (один габарит шире и длиннее кабины,
// и предмет оставался бы прозрачным, уже уйдя с машины). Край мягкий: объем расширен на margin, полная прозрачность —
// от хорды луча 2·margin (так гаснет весь силуэт объема). Пол перед машиной не стоит никогда — его не трогаем.
const SEE_THROUGH = { alpha: 0.25, margin: 0.1 };

export const loadBox = async (ktx2: KTX2Loader, files: SceneFiles) => {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx2);

  try {
    return (await loader.loadAsync(files.box)).scene;
  } catch (error) {
    throw new SceneLoadError(files.box, error);
  }
};

// Зеркало пола: сцена из отраженной камеры в текстуру; шейдер берет ее, гасит к краям поста и складывает с полом.
const mirrorShader = {
  name: 'FloorMirrorShader',
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uStrength: { value: MIRROR.strength },
    uFade: { value: new THREE.Vector2(...MIRROR.fade) },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vWorld;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorld = world.xyz;
      gl_Position = projectionMatrix * viewMatrix * world;
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform vec2 uFade;
    varying vec4 vUv;
    varying vec3 vWorld;
    void main() {
      vec3 reflected = texture2DProj(tDiffuse, vUv).rgb;
      float fade = 1.0 - smoothstep(uFade.x, uFade.y, length(vWorld.xz));
      gl_FragColor = vec4(reflected * uStrength * fade, 1.0);
    }`,
};

// Прозрачность без сортировки и лишних проходов — покрытием MSAA (alpha-to-coverage): фрагмент закрывает долю
// сэмплов, после сведения пиксель — смесь бокса и машины за ним, ни один пиксель бокса не остается непрозрачным.
// Сэмплов мало (телефон — 2) → доля округляется по пикселям шахматкой 2×2 и в среднем равна alpha. Без MSAA
// (сэмпл один) покрытие — все или ничего: тогда та же доля — экранным дизерингом, фрагменты сверх нее отбрасываются.
const seeThroughGlsl = /* glsl */ `
  uniform vec3 uBodyMin;
  uniform vec3 uBodyMax;
  uniform vec3 uCabinMin;
  uniform vec3 uCabinMax;
  uniform float uSeeMargin;
  uniform float uSeeAlpha;
  uniform float uSamples;
  varying vec3 vBoxWorld;
  float volumeAlpha(vec3 low, vec3 high, vec3 dir, float depth) {
    vec3 t1 = (low - uSeeMargin - cameraPosition) / dir;
    vec3 t2 = (high + uSeeMargin - cameraPosition) / dir;
    vec3 tMin = min(t1, t2);
    vec3 tMax = max(t1, t2);
    float enter = max(max(tMin.x, tMin.y), tMin.z);
    float exit = min(min(tMax.x, tMax.y), tMax.z);
    if (exit <= max(enter, 0.0) || depth >= exit) return 1.0;
    return mix(1.0, uSeeAlpha, smoothstep(0.0, 2.0 * uSeeMargin, exit - enter));
  }
  float seeThrough() {
    vec3 toFrag = vBoxWorld - cameraPosition;
    float depth = length(toFrag);
    vec3 dir = toFrag / depth;
    float alpha = min(volumeAlpha(uBodyMin, uBodyMax, dir, depth), volumeAlpha(uCabinMin, uCabinMax, dir, depth));
    vec2 cell = mod(floor(gl_FragCoord.xy), 2.0);
    float dither = (abs(cell.x - cell.y) * 2.0 + cell.y) * 0.25 + 0.125;
    if (uSamples < 1.5) {
      if (alpha < dither) discard;
      return 1.0;
    }
    return min(floor(alpha * uSamples + dither) / uSamples, 1.0);
  }`;

type SeeThroughUniforms = {
  uBodyMin: THREE.IUniform<THREE.Vector3>;
  uBodyMax: THREE.IUniform<THREE.Vector3>;
  uCabinMin: THREE.IUniform<THREE.Vector3>;
  uCabinMax: THREE.IUniform<THREE.Vector3>;
  uSeeMargin: THREE.IUniform<number>;
  uSeeAlpha: THREE.IUniform<number>;
  uSamples: THREE.IUniform<number>;
};

const patchSeeThrough = (material: THREE.Material, uniforms: SeeThroughUniforms) => {
  material.alphaToCoverage = uniforms.uSamples.value > 1;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBoxWorld;')
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\n  vBoxWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${seeThroughGlsl}`)
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n  gl_FragColor.a = seeThrough();');
  };
  material.customProgramCacheKey = () => 'box-see-through';
};

type BoxMaterial = THREE.MeshStandardMaterial;

// box — сцена env.glb; mirror — зеркало пола (десктоп); samples — сэмплы MSAA цели рендера (0 и 1 — без MSAA).
// resize(width, height) — размер холста в пикселях буфера; setCar(body, cabin) — мировые объемы машины (Box3,
// с подъемом).
export const prepareBox = (box: THREE.Object3D, { mirror, samples }: { mirror: boolean; samples: number }) => {
  const liftArm = box.getObjectByName('lift_arm');
  const liftMax = liftArm?.userData.lift_max;

  if (!liftArm || typeof liftMax !== 'number') {
    throw new Error('В env.glb нет lift_arm с extras.lift_max (CONTRACT.md)');
  }

  const seeThrough: SeeThroughUniforms = {
    uBodyMin: { value: new THREE.Vector3() },
    uBodyMax: { value: new THREE.Vector3() },
    uCabinMin: { value: new THREE.Vector3() },
    uCabinMax: { value: new THREE.Vector3() },
    uSeeMargin: { value: SEE_THROUGH.margin },
    uSeeAlpha: { value: SEE_THROUGH.alpha },
    uSamples: { value: Math.max(samples, 1) },
  };
  const materials = new Set<BoxMaterial>();

  box.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;
    const material = (object as THREE.Mesh).material as BoxMaterial;

    materials.add(material);
    const moving = Boolean(liftArm.getObjectById(object.id));
    const floor = object.name === 'env_floor';

    // запеченный бокс: свет — только в карте излучения; подвижная часть — PBR под окружением
    if (!moving) material.envMapIntensity = floor ? FLOOR_ENV_INTENSITY : 0;
    if (!floor) patchSeeThrough(material, seeThrough);
  });

  let reflector: Reflector | null = null;

  if (mirror) {
    const floor = box.getObjectByName('env_floor') as THREE.Mesh;

    floor.geometry.computeBoundingBox();
    const bounds = floor.geometry.boundingBox!;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    reflector = new Reflector(new THREE.PlaneGeometry(size.x, size.z), {
      textureWidth: 1,
      textureHeight: 1,
      clipBias: 0.003,
      shader: mirrorShader,
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.set(center.x, 0.0005, center.z);
    const mirrorMaterial = reflector.material as THREE.ShaderMaterial;

    mirrorMaterial.transparent = true;
    mirrorMaterial.blending = THREE.AdditiveBlending;
    mirrorMaterial.depthWrite = false;
    reflector.renderOrder = -1;
    reflector.name = 'floor_mirror';
    box.add(reflector);
  }

  return {
    liftArm,
    liftMax,
    resize(width: number, height: number) {
      const scaled = (value: number) => Math.max(1, Math.round(value * MIRROR.scale));

      reflector?.getRenderTarget().setSize(scaled(width), scaled(height));
    },
    setCar(body: THREE.Box3, cabin: THREE.Box3) {
      seeThrough.uBodyMin.value.copy(body.min);
      seeThrough.uBodyMax.value.copy(body.max);
      seeThrough.uCabinMin.value.copy(cabin.min);
      seeThrough.uCabinMax.value.copy(cabin.max);
    },
    dispose() {
      box.traverse((object) => (object as THREE.Mesh).geometry?.dispose());
      materials.forEach((material) => {
        TEXTURE_SLOTS.forEach((slot) => material[slot]?.dispose());
        material.dispose();
      });
      reflector?.dispose();
    },
  };
};

export type PreparedBox = ReturnType<typeof prepareBox>;
