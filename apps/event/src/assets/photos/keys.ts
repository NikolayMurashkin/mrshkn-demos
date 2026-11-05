/**
 * Ключи кадров демо. Отдельно от карты `PHOTOS`: константы и типы берут ключи без импорта картинок — CLI Payload
 * грузит конфиг через tsx, который импорт картинок не понимает.
 */
export const PHOTO_KEYS = [
  'poster',
  'quartet',
  'venue',
  'gallery-stage',
  'gallery-piano',
  'gallery-bass',
  'gallery-drums',
  'gallery-saxophones',
  'gallery-silhouettes',
] as const satisfies readonly string[];

export type PhotoKey = (typeof PHOTO_KEYS)[number];
