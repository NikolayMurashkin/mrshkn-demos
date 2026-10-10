import type { DemoLang } from '@mrshkn/demo-core/types';

/** Языки демо: первый — язык по умолчанию, на него ведут `/` и `/privacy`. */
export const LANGS: DemoLang[] = ['ru', 'en'];

export const DEFAULT_LANG: DemoLang = 'ru';

export const LANG_CODES: Record<DemoLang, string> = { ru: 'RU', en: 'EN' };

/** Цены в рублях на русском и в долларах рынка США на английском: работа без запчастей, не пересчет курса. */
export const NUMBER_LOCALES: Record<DemoLang, string> = { ru: 'ru-RU', en: 'en-US' };

export const CURRENCIES: Record<DemoLang, string> = { ru: 'RUB', en: 'USD' };

/** Узлы «где болит» в порядке сцены. */
export const NODE_KEYS = [
  'engine',
  'suspension',
  'brakes',
  'steering',
  'electrics',
  'cooling',
  'exhaust',
  'transmission',
] as const;

/** Места разнесенных узлов в сцене: привод ГРМ у двигателя, задняя ось у подвески и тормозов. */
export const SYMPTOM_PLACES = ['timing', 'rear'] as const;

/** Пустые места под объяснялки в карточках узлов: их наполнит интерактив сцены. */
export const EXPLAINERS: Partial<Record<string, string>> = { suspension: 'suspension', engine: 'chain' };

/** Узкий постер и раскладка телефона: сцена сверху, под ней карточка и симптомы. */
export const POSTER_NARROW_MEDIA = '(max-width: 480px)';

export const STACKED_MEDIA = '(max-width: 1023px)';

export const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';
