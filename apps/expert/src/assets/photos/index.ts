import type { StaticImageData } from 'next/image';
import articleBurnoutSigns from './article-burnout-signs.jpg';
import articleCoupleConflicts from './article-couple-conflicts.jpg';
import articleFirstSession from './article-first-session.jpg';
import articleNightAnxiety from './article-night-anxiety.jpg';
import articlePsychologistOrPsychiatrist from './article-psychologist-or-psychiatrist.jpg';
import articleSelfCriticism from './article-self-criticism.jpg';
import portrait from './portrait.jpg';
import type { PhotoKey } from './keys';

/**
 * Карта кадров демо: ключ — значение поля `photo` в CMS, файл — статический импорт из этой папки. Новый кадр — ключ
 * в `keys.ts`, файл сюда, строка в `docs/photo-credits.md`: по жалобе его находят и снимают. Конфигу Payload карту
 * не импортировать — только `keys.ts`.
 */
export const PHOTOS: Record<PhotoKey, StaticImageData> = {
  portrait,
  'article-night-anxiety': articleNightAnxiety,
  'article-first-session': articleFirstSession,
  'article-psychologist-or-psychiatrist': articlePsychologistOrPsychiatrist,
  'article-burnout-signs': articleBurnoutSigns,
  'article-couple-conflicts': articleCoupleConflicts,
  'article-self-criticism': articleSelfCriticism,
};
