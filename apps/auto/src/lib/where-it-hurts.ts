import type { AutoNode, AutoSymptom, WhereItHurts } from '../cms/types';

/** Симптом и его узел — то, что откроет карточка. Неизвестный симптом или симптом без узла — `null`. */
export const selectSymptom = (
  data: WhereItHurts,
  symptomKey: string,
): { symptom: AutoSymptom; node: AutoNode } | null => {
  const symptom = data.symptoms.find(({ key }) => key === symptomKey);
  const node = symptom && data.nodes.find(({ key }) => key === symptom.node);

  return symptom && node ? { symptom, node } : null;
};
