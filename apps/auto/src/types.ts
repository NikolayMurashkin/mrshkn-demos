import type { DemoLang } from '@mrshkn/demo-core/types';
import type { Run } from './scene/physics/quarter-car';
import type { SuspensionRide } from './scene/types';

export type LangParams = Promise<{ lang: string }>;

export type LangPageProps = {
  params: LangParams;
};

/** Что открыло карточку узла: на это место вернется фокус, когда карточку закроют. */
export type CardOpener = { kind: 'symptom' | 'node'; key: string };

/** Выбор на первом экране: узел, симптом, которым его открыли, и место разнесенного узла в сцене. */
export type Selection = { node: string; symptom: string | null; place: string | null };

/** Положения ползунков объяснялок: переживают смену карточки. */
export type ExplainValues = { wear: number; stretch: number };

/** Объяснялка в сцене: качание машины по расчету или отставание звездочки распредвала, радианы. */
export type SceneExplain = { kind: 'suspension'; ride: SuspensionRide } | { kind: 'chain'; lag: number };

export type Localized<T> = Record<DemoLang, T>;

/** Проезд кочки при износе: расчет передней оси, время затухания, цикл сцены и доля времени без контакта. */
export type Ride = { front: Run; settle: number; period: number; air: number };

/** Нажатие на холст: где и когда, чтобы отличить клик по узлу от поворота камеры. */
export type Press = { x: number; y: number; time: number };

/** Выноска к карточке: угол сцены и конец линии у заголовка карточки, пиксели от угла первого экрана. */
export type LeaderLayout = { stageX: number; stageY: number; endX: number; endY: number };

/** Холст сцены CSS-выражениями: ширина и высота, по которым `sizes` постера считает ширину рисунка. */
export type StageCanvas = { width: string; height: string };
