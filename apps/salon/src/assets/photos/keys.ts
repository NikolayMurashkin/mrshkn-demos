/**
 * Ключи кадров демо — значения поля `photo` в CMS. Отдельно от карты `PHOTOS`: конфиг Payload импортирует их, а CLI
 * Payload грузит конфиг через tsx, который не понимает импорт картинок. Мастер без кадра — плита с каплями вместо
 * портрета.
 */
export const PHOTO_KEYS = [
  'master-alina',
  'master-daria',
  'master-marina',
  'master-eva',
  'master-olga',
  'work-alina-1',
  'work-alina-2',
  'work-alina-3',
  'work-daria-1',
  'work-daria-2',
  'work-daria-3',
  'work-marina-1',
  'work-marina-2',
  'work-marina-3',
  'work-eva-1',
  'work-eva-2',
  'work-eva-3',
  'work-olga-1',
  'work-olga-2',
  'work-olga-3',
  'salon-interior',
] as const satisfies readonly string[];

export type PhotoKey = (typeof PHOTO_KEYS)[number];
