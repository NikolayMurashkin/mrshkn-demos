// Модель «четверть автомобиля»: кузов (масса body) на пружине и амортизаторе над колесом (масса wheel), колесо —
// на шине. Шина только давит: контакт односторонний, колесо отрывается от дороги, когда шина разгружена полностью.
// Координаты — вертикальные смещения от статического равновесия, метры, вверх — плюс; дорога — road(t), метры.
// Интегратор — Рунге — Кутта 4-го порядка с постоянным шагом. Без DOM и three: те же функции считают графики и сцену.

export type CornerTable = {
  g: number;
  bodyMass: number;
  wheelMass: number;
  bodyFrequency: number;
  tireRate: number;
  dampingRatioNew: number;
};

export type CornerParams = {
  g: number;
  bodyMass: number;
  wheelMass: number;
  springRate: number;
  tireRate: number;
  damping: number;
};

export type Road = (t: number) => number;

export type Run = {
  dt: number;
  body: Float64Array;
  contact: Uint8Array;
  states: number[][] | null;
};

export type SimulateOptions = {
  road?: Road;
  duration: number;
  dt: number;
  initial?: ArrayLike<number>;
  keepStates?: boolean;
};

// Параметры угла из таблицы констант при износе амортизатора wear (0 — новый, 1 — демпфирования нет).
// Жесткость подвески, приведенная к колесу, — из частоты кузова: k = m·(2πf)². Коэффициент демпфирования нового
// амортизатора — из относительного демпфирования кузова ζ = c / (2√(k·m)); износ — доля потерянного усилия:
// c = c_new · (1 − wear).
export const cornerParams = (
  { g, bodyMass, wheelMass, bodyFrequency, tireRate, dampingRatioNew }: CornerTable,
  wear: number,
): CornerParams => {
  const springRate = bodyMass * (2 * Math.PI * bodyFrequency) ** 2;

  return {
    g,
    bodyMass,
    wheelMass,
    springRate,
    tireRate,
    damping: 2 * dampingRatioNew * Math.sqrt(springRate * bodyMass) * (1 - wear),
  };
};

// Кочка — полуволна косинуса высотой height и длиной length; колесо наезжает на нее в момент start на скорости speed.
export const bumpRoad =
  ({ height, length, speed, start = 0 }: { height: number; length: number; speed: number; start?: number }): Road =>
  (t) => {
    const x = (t - start) * speed;

    return x > 0 && x < length ? (height / 2) * (1 - Math.cos((2 * Math.PI * x) / length)) : 0;
  };

// Сжатие шины в равновесии: она держит вес кузова и колеса.
const tireStatic = ({ g, bodyMass, wheelMass, tireRate }: CornerParams) => ((bodyMass + wheelMass) * g) / tireRate;

// Сила шины: сжатие сверх нуля, растянуться шина не может.
const tireForce = (p: CornerParams, wheel: number, road: number) =>
  Math.max(0, p.tireRate * (tireStatic(p) - (wheel - road)));

// Состояние [кузов, скорость кузова, колесо, скорость колеса] → производные в out. Подвеска с предварительным сжатием
// держит вес кузова, поэтому в уравнении кузова тяжести нет; колесо несет вес обоих тел через шину.
const derivatives = (p: CornerParams, road: Road, t: number, s: Float64Array, out: Float64Array) => {
  const suspension = p.springRate * (s[2] - s[0]) + p.damping * (s[3] - s[1]);
  const tire = tireForce(p, s[2], road(t));

  out[0] = s[1];
  out[1] = suspension / p.bodyMass;
  out[2] = s[3];
  out[3] = (tire - suspension - (p.bodyMass + p.wheelMass) * p.g) / p.wheelMass;
};

// Шаг РК4 на месте, без выделения памяти: ползунок пересчитывает десятки тысяч шагов, на телефоне это заметно.
const createRk4 = (p: CornerParams, road: Road) => {
  const [k1, k2, k3, k4, mid] = Array.from({ length: 5 }, () => new Float64Array(4));
  const shifted = (state: Float64Array, k: Float64Array, h: number) => {
    for (let i = 0; i < 4; i++) mid[i] = state[i] + h * k[i];

    return mid;
  };

  return (t: number, state: Float64Array, dt: number) => {
    derivatives(p, road, t, state, k1);
    derivatives(p, road, t + dt / 2, shifted(state, k1, dt / 2), k2);
    derivatives(p, road, t + dt / 2, shifted(state, k2, dt / 2), k3);
    derivatives(p, road, t + dt, shifted(state, k3, dt), k4);
    for (let i = 0; i < 4; i++) state[i] += (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  };
};

// Прогон: duration секунд с шагом dt из состояния initial. Ряды по шагам (включая t = 0): кузов и контакт шины
// с дорогой (1 — давит, 0 — колесо в воздухе); keepStates — еще полные состояния (проверка энергии).
export const simulate = (
  p: CornerParams,
  { road = () => 0, duration, dt, initial = [0, 0, 0, 0], keepStates = false }: SimulateOptions,
): Run => {
  const steps = Math.round(duration / dt);
  const body = new Float64Array(steps + 1);
  const contact = new Uint8Array(steps + 1);
  const states: number[][] | null = keepStates ? [] : null;
  const step = createRk4(p, road);
  const state = Float64Array.from(initial);

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;

    body[i] = state[0];
    contact[i] = tireForce(p, state[2], road(t)) > 0 ? 1 : 0;
    if (states) states.push(Array.from(state));
    if (i < steps) step(t, state, dt);
  }

  return { dt, body, contact, states };
};

// Полная механическая энергия: движение, пружина с предварительным сжатием, шина (только сжатая), тяжесть.
// Без амортизатора и при ровной дороге сохраняется — проверка интегратора.
export const energy = (p: CornerParams, [body, bodyV, wheel, wheelV]: readonly number[], road = 0) => {
  const springPreload = (p.bodyMass * p.g) / p.springRate;
  const spring = (p.springRate / 2) * (springPreload - body + wheel) ** 2;
  const tireSquash = Math.max(0, tireStatic(p) - (wheel - road));
  const tire = (p.tireRate / 2) * tireSquash ** 2;
  const gravity = p.g * (p.bodyMass * body + p.wheelMass * wheel);

  return (p.bodyMass * bodyV ** 2) / 2 + (p.wheelMass * wheelV ** 2) / 2 + spring + tire + gravity;
};

// Время затухания: с момента from до последнего выхода кузова за fraction от наибольшего отклонения.
// Infinity — колебания не затухли до конца прогона.
export const settlingTime = (
  { dt, body }: Pick<Run, 'dt' | 'body'>,
  { from = 0, fraction }: { from?: number; fraction: number },
) => {
  const first = Math.round(from / dt);
  let peak = 0;

  for (let i = first; i < body.length; i++) peak = Math.max(peak, Math.abs(body[i]));
  if (peak === 0) return 0;
  let last = first;

  for (let i = first; i < body.length; i++) if (Math.abs(body[i]) > fraction * peak) last = i;
  if (last >= body.length - 1) return Infinity;

  return (last + 1 - first) * dt;
};

// Доля времени окна [from, to), когда колесо не давит на дорогу.
export const airborneShare = (
  { dt, contact }: Pick<Run, 'dt' | 'contact'>,
  { from, to }: { from: number; to: number },
) => {
  const first = Math.round(from / dt);
  const end = Math.min(Math.round(to / dt), contact.length);
  let air = 0;

  for (let i = first; i < end; i++) air += 1 - contact[i];

  return end > first ? air / (end - first) : 0;
};
