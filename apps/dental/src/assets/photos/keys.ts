/**
 * Ключи кадров демо — значения поля `photo` в CMS. Отдельно от карты `PHOTOS`: конфиг Payload импортирует их, а CLI
 * Payload грузит конфиг через tsx, который не понимает импорт картинок.
 */
export const PHOTO_KEYS = [
  'lisitsyna',
  'berezhnoy',
  'koltsova',
  'shumeyko',
  'vetrova',
  'tarnovsky',
  'mezentseva',
  'interior',
  'waiting',
  'cabinet',
  'instruments',
] as const satisfies readonly string[];

export type PhotoKey = (typeof PHOTO_KEYS)[number];
