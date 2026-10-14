// Объяснялки в сцене. Двигаются только опоры из CONTRACT.md и машина целиком.
// Подвеска: машина поднимается и наклоняется по расчету «четверти автомобиля» для передней и задней оси (задняя
// наезжает на кочку позже на базу / скорость); стойки не сжимаются — статичные сетки слиты по материалу, кузов
// и колесо по отдельности не сдвинуть, ход подвески показывает график. Колеса крутятся со скоростью проезда.
// Цепь: звездочка распредвала повернута на отставание, рядом «тень» штатного положения в виде «Снимка»; на обеих —
// метка, как установочная метка ГРМ: угол между янтарной (звездочка) и голубой (тень) — отставание распредвала.
import * as THREE from 'three';
import type { RideCurve, SuspensionRide } from './types';

const WHEELS = ['fl', 'fr', 'rl', 'rr'];
const LOCAL_Y = new THREE.Vector3(0, 1, 0);
const LOCAL_Z = new THREE.Vector3(0, 0, 1);
// Метка: от ступицы за венец звездочки (радиус по шагу 0,0769 м), метры.
const MARK = { from: 0.03, to: 0.11, width: 0.004 };

type ExplainersOptions = {
  snapshotMaterial: THREE.ShaderMaterial;
  wheelbase: number;
  wheelRadius: number;
  colors: { amber: string; xray: string };
};

export const createExplainers = (
  model: THREE.Object3D,
  { snapshotMaterial, wheelbase, wheelRadius, colors }: ExplainersOptions,
) => {
  const find = (name: string) => {
    const object = model.getObjectByName(name);

    if (!object) throw new Error(`В модели нет ${name} (CONTRACT.md)`);

    return object;
  };
  const turn = new THREE.Quaternion();
  const rotated = (node: THREE.Object3D, base: THREE.Quaternion, axis: THREE.Vector3, angle: number) =>
    node.quaternion.copy(base).multiply(turn.setFromAxisAngle(axis, angle));

  // Левые колеса при движении вперед поворачиваются в минус по своей Z, правые (развернуты) — в плюс.
  const wheels = WHEELS.map((id) => {
    const node = find(`wheel_${id}`);

    return { node, base: node.quaternion.clone(), sign: id.endsWith('l') ? -1 : 1 };
  });
  const cam = find('sprocket_cam');
  const camBase = cam.quaternion.clone();

  // «Тень»: копии сеток звездочки (без двойников сканера) в штатном положении. nodeIndex −1 — как у кузова:
  // внутри сферы выбранного двигателя тень рисуется снимком, а сама звездочка — настоящими материалами. Тень лежит
  // в плоскости звездочки — без теста глубины, иначе муар; униформы сканера — те же объекты, что у снимка.
  const ghostMaterial = snapshotMaterial.clone();

  ghostMaterial.uniforms = snapshotMaterial.uniforms;
  ghostMaterial.depthTest = false;
  const ghost = new THREE.Group();

  ghost.position.copy(cam.position);
  ghost.quaternion.copy(camBase);
  cam.children
    .filter(
      (child): child is THREE.Mesh => (child as THREE.Mesh).isMesh === true && child.name.startsWith('sprocket_cam_'),
    )
    .forEach((mesh) => {
      const geometry = mesh.geometry.clone();

      geometry.setAttribute(
        'nodeIndex',
        new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').count).fill(-1), 1),
      );
      const copy = new THREE.Mesh(geometry, ghostMaterial);

      copy.position.copy(mesh.position);
      copy.quaternion.copy(mesh.quaternion);
      copy.scale.copy(mesh.scale);
      copy.renderOrder = 2;
      ghost.add(copy);
    });
  // Метка смотрит вверх при штатном положении; лежит перед гранью звездочки (к камере — против локальной Y).
  model.updateMatrixWorld(true);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.getWorldQuaternion(new THREE.Quaternion()).invert());

  up.addScaledVector(LOCAL_Y, -up.dot(LOCAL_Y)).normalize();
  const side = new THREE.Vector3().crossVectors(up, LOCAL_Y);
  const markGeometry = new THREE.BoxGeometry(MARK.width, MARK.to - MARK.from, 0.001);
  const marks: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[] = [];
  const mark = (parent: THREE.Object3D, color: string) => {
    const material = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
    const mesh = new THREE.Mesh(markGeometry, material);

    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, LOCAL_Y));
    mesh.position
      .copy(up)
      .multiplyScalar((MARK.from + MARK.to) / 2)
      .addScaledVector(LOCAL_Y, -0.015);
    mesh.renderOrder = 3;
    parent.add(mesh);
    marks.push(mesh);
  };

  mark(cam, colors.amber);
  mark(ghost, colors.xray);
  const showMarks = (visible: boolean) => marks.forEach((mesh) => (mesh.visible = visible));

  showMarks(false);
  ghost.visible = false;
  cam.parent?.add(ghost);

  const rest = () => {
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    wheels.forEach(({ node, base }) => node.quaternion.copy(base));
    cam.quaternion.copy(camBase);
    ghost.visible = false;
    showMarks(false);
  };

  // Ряд кузова в момент t: линейно между шагами расчета, за концом — последнее значение.
  const sample = ({ dt, body }: RideCurve, t: number) => {
    const x = Math.min(Math.max(t / dt, 0), body.length - 1);
    const i = Math.floor(x);
    const j = Math.min(i + 1, body.length - 1);

    return body[i] + (body[j] - body[i]) * (x - i);
  };

  return {
    // front — расчет передней оси (simulate), задняя — он же на rearDelay секунд позже; t — время с начала цикла,
    // speed — м/с.
    suspension({ front, rearDelay, speed }: SuspensionRide, t: number) {
      const zFront = sample(front, t);
      const zRear = sample(front, t - rearDelay);

      model.position.y = (zFront + zRear) / 2;
      model.rotation.z = Math.atan2(zFront - zRear, wheelbase);
      const angle = (speed * t) / wheelRadius;

      wheels.forEach(({ node, base, sign }) => rotated(node, base, LOCAL_Z, sign * angle));
    },
    // lag — отставание распредвала, радианы распредвала; двигатель вращает звездочки в плюс по их Y.
    chain(lag: number) {
      rotated(cam, camBase, LOCAL_Y, -lag);
      ghost.visible = true;
      showMarks(true);
    },
    rest,
    dispose() {
      ghost.children.forEach((child) => (child as THREE.Mesh).geometry.dispose());
      ghostMaterial.dispose();
      markGeometry.dispose();
      marks.forEach((mesh) => {
        mesh.material.dispose();
        mesh.removeFromParent();
      });
      ghost.removeFromParent();
    },
  };
};
