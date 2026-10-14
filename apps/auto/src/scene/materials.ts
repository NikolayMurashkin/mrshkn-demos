// Материалы вида «Сканер»: машина в краске (PBR), а там, где прошел сканер, — «Снимок» по закону ослабления.
// Область сканера — объединение плоскости (снимок перед фронтом x > uPlaneX) и сферы вокруг выбранного узла;
// SDF < 0 — внутри. Краска внутри области отбрасывается, снимок — снаружи; на границе — светящаяся полоса.
// Униформы общие для всех материалов: один объект scan на сцену.
import * as THREE from 'three';
import type { SceneColors, ScanUniforms } from './types';

// Веса каналов пленки: синеватый снимок без отдельной цветокоррекции.
const FILM_WEIGHTS = new THREE.Vector3(0.7, 0.85, 1.0);
// Полоса фронта: сплошное ядро |SDF| < 9 мм с краем до 13 мм (ширина ~2 см, как контур среза на постере: там ~4 px
// при ~190 px на метр), спад свечения до 2 см — на 2 см от фронта поверхность уже не светится (подголовники на
// постере стоят в 2 см за ним), край возмущен шумом на ±1,5 мм.
const BAND = { core: [0.009, 0.013], halo: [0.013, 0.02], noise: 0.0015, noiseScale: 40 };

export const createScanUniforms = (colors: SceneColors): ScanUniforms => ({
  uPlaneX: { value: 100 },
  uSphere: { value: new THREE.Vector4(0, 0, 0, 0) },
  uSelected: { value: -1 },
  uBandPeak: { value: new THREE.Color(colors.peak) },
  uBandGlow: { value: new THREE.Color(colors.xray) },
  uBandGain: { value: 1 },
  uCut: { value: new THREE.Color(colors.cut) },
});

const scanUniformsGlsl = /* glsl */ `
  uniform float uPlaneX;
  uniform vec4 uSphere;
  uniform float uSelected;
  uniform vec3 uBandPeak;
  uniform vec3 uBandGlow;
  uniform float uBandGain;
  varying vec3 vScanWorld;
  varying float vNode;

  float scanHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float scanNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = scanHash(i);
    float b = scanHash(i + vec2(1.0, 0.0));
    float c = scanHash(i + vec2(0.0, 1.0));
    float d = scanHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Расстояние до границы области сканера: < 0 — внутри (снимок).
  float scanDistance(vec3 p) {
    float plane = uPlaneX - p.x;
    float sphere = uSphere.w > 0.0 ? length(p - uSphere.xyz) - uSphere.w : 1e3;
    vec2 q = vec2(p.y + p.x * 0.5, p.z - p.x * 0.5) * ${BAND.noiseScale.toFixed(1)};
    return min(plane, sphere) + (scanNoise(q) - 0.5) * ${(BAND.noise * 2).toFixed(4)};
  }

  // Выбранный узел: у кузова индекс −1, как у «ничего не выбрано», поэтому сначала — что это узел.
  bool scanOwn() {
    return vNode > -0.5 && abs(vNode - uSelected) < 0.5;
  }

  // Свечение полосы: ядро почти белое, спад — голубой; скан-линии через 3 px — только внутри полосы.
  vec3 scanBand(float d) {
    float a = abs(d);
    float core = 1.0 - smoothstep(${BAND.core[0]}, ${BAND.core[1]}, a);
    float halo = 1.0 - smoothstep(${BAND.halo[0]}, ${BAND.halo[1]}, a);
    float lines = halo > 0.0 ? 0.55 + 0.45 * step(1.5, mod(gl_FragCoord.y, 3.0)) : 0.0;
    return (uBandPeak * core * 2.6 + uBandGlow * halo * halo * 0.7 * lines) * uBandGain;
  }
`;

const scanVertexGlsl = /* glsl */ `
  vec4 scanWorld = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    scanWorld = instanceMatrix * scanWorld;
  #endif
  vScanWorld = (modelMatrix * scanWorld).xyz;
  vNode = nodeIndex;
`;

// Краска и настоящие материалы из GLB: отбрасываются внутри области сканера (кроме выбранного узла);
// задние грани кузова — темный цвет среза, как у разрезанной оболочки.
export const patchPaintMaterial = <T extends THREE.Material>(material: T, scan: ScanUniforms) => {
  material.side = THREE.DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, scan);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float nodeIndex;\nvarying vec3 vScanWorld;\nvarying float vNode;',
      )
      .replace('#include <project_vertex>', `#include <project_vertex>\n${scanVertexGlsl}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${scanUniformsGlsl}\nuniform vec3 uCut;`)
      .replace(
        'void main() {',
        'void main() {\n  float scanD = scanDistance(vScanWorld);\n  bool scanSelf = scanOwn();\n  if (scanD < 0.0 && !scanSelf) discard;',
      )
      .replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\n  if (!gl_FrontFacing && vNode < -0.5) gl_FragColor = vec4(uCut, 1.0);\n  if (!scanSelf) gl_FragColor.rgb += scanBand(scanD);',
      );
  };
  material.customProgramCacheKey = () => 'scan-paint';
  material.needsUpdate = true;

  return material;
};

// «Снимок»: a = 1 − exp(−k·w / max(|n·v|, 0,05)), экранное смешение (результат = a + фон·(1 − a)) — порядок
// слоев не важен, сортировка не нужна. k — атрибут вершины (extras.xray_k сетки) × uKScale; прочие узлы при
// выбранном — еще × uDimK. Рисуется только внутри области сканера; выбранный узел — краской, не снимком.
export const createSnapshotMaterial = (scan: ScanUniforms, { kScale, dimK }: { kScale: number; dimK: number }) =>
  new THREE.ShaderMaterial({
    uniforms: { ...scan, uW: { value: FILM_WEIGHTS }, uKScale: { value: kScale }, uDimK: { value: dimK } },
    vertexShader: /* glsl */ `
      attribute float nodeIndex;
      attribute float xrayK;
      varying vec3 vScanWorld;
      varying float vNode;
      varying float vK;
      varying vec3 vNormalView;
      varying vec3 vViewDir;

      void main() {
        vec3 transformed = position;
        vec3 objectNormal = normal;
        #ifdef USE_INSTANCING
          objectNormal = mat3(instanceMatrix) * objectNormal;
        #endif
        vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        ${scanVertexGlsl}
        vK = xrayK;
        vNormalView = normalize(normalMatrix * objectNormal);
        vViewDir = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uW;
      uniform float uKScale;
      uniform float uDimK;
      varying float vK;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      ${scanUniformsGlsl}

      void main() {
        float d = scanDistance(vScanWorld);
        if (d >= 0.0 || scanOwn()) discard;
        float k = vK * uKScale * (uSelected > -0.5 && vNode > -0.5 ? uDimK : 1.0);
        float facing = max(abs(dot(normalize(vNormalView), normalize(vViewDir))), 0.05);
        vec3 a = 1.0 - exp(-k * uW / facing);
        gl_FragColor = vec4(a + scanBand(d), 1.0);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    forceSinglePass: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcColorFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });

// Контур выбранного узла: инвертированная оболочка — задние грани, раздутые по нормали на width метров; только внутри
// сферы сканера, иначе контур деталей узла просвечивает в щели кузова вокруг дыры.
export const createOutlineMaterial = (scan: ScanUniforms, color: string, width: number) =>
  new THREE.ShaderMaterial({
    uniforms: { uSphere: scan.uSphere, uColor: { value: new THREE.Color(color) }, uWidth: { value: width } },
    vertexShader: /* glsl */ `
      uniform float uWidth;
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vec3 n = normalize(transpose(inverse(mat3(modelMatrix))) * normal);
        vWorld = world.xyz + n * uWidth;
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec4 uSphere;
      uniform vec3 uColor;
      varying vec3 vWorld;
      void main() {
        if (length(vWorld - uSphere.xyz) > uSphere.w) discard;
        gl_FragColor = vec4(uColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
