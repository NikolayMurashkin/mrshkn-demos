import type { SurveyQuestionName } from '@mrshkn/demo-core/types';

export type SurveyQuestion = {
  name: SurveyQuestionName;
  text: string;
  /** Пояснение под вопросом, который можно пропустить. */
  note?: string;
};

export type SurveyStatus = 'idle' | 'sending' | 'sent' | 'ratings' | 'rate' | 'failed';
