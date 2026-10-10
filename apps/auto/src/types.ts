import type { DemoLang } from '@mrshkn/demo-core/types';

export type LangParams = Promise<{ lang: string }>;

export type LangPageProps = {
  params: LangParams;
};

/** Что открыло карточку узла: на это место вернется фокус, когда карточку закроют. */
export type CardOpener = { kind: 'symptom' | 'node'; key: string };

export type Selection = { node: string; symptom: string | null };

export type Localized<T> = Record<DemoLang, T>;
