import type { DemoReview } from '@mrshkn/demo-core/types';
import type { NODE_KEYS } from '../consts';
import type { Localized } from '../types';

/** Вероятная причина неисправности узла: цена работы «от» в валюте языка и срок. */
export type AutoCause = { text: string; price: number; term: string };

export type AutoNode = { key: string; name: string; causes: AutoCause[] };

/** Симптом ведет в узел: `node` — `key` узла. */
export type AutoSymptom = { key: string; node: string; text: string };

/** «Где болит» на одном языке: то, что берет страница. */
export type WhereItHurts = { nodes: AutoNode[]; symptoms: AutoSymptom[] };

export type NodeKey = (typeof NODE_KEYS)[number];

export type SeedNode = {
  key: NodeKey;
  content: Localized<{ name: string; causes: AutoCause[] }>;
};

export type SeedSymptom = {
  key: string;
  node: NodeKey;
  /** Где показать разнесенный узел в сцене: привод ГРМ или задняя ось. */
  place?: 'timing' | 'rear';
  text: Localized<string>;
};

export type SeedReview = Localized<DemoReview>;
