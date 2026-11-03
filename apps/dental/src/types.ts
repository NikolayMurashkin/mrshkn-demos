import type { SurveyQuestionName } from '@mrshkn/demo-core/types';
import type { PhotoKey } from './assets/photos/keys';

/** Кадр клиники на главной: ключ карты кадров и `alt`. */
export type ClinicShot = {
  photo: PhotoKey;
  alt: string;
};

/** Секция «Клиника изнутри»: кадры с подписью `kicker` под каждым. */
export type ClinicInside = {
  label: string;
  title: string;
  shots: (ClinicShot & { caption: string })[];
};

export type SurveyQuestion = {
  name: SurveyQuestionName;
  text: string;
  /** Пояснение под вопросом, который можно пропустить. */
  note?: string;
};

export type SurveyStatus = 'idle' | 'sending' | 'sent' | 'ratings' | 'rate' | 'failed';
