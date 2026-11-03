/**
 * Ключи кадров демо — значения поля `photo` в CMS. Отдельно от карты `PHOTOS`: конфиг Payload импортирует их, а CLI
 * Payload грузит конфиг через tsx, который не понимает импорт картинок.
 */
export const PHOTO_KEYS = [
  'espresso',
  'americano',
  'cappuccino',
  'flat-white',
  'oat-latte',
  'raf',
  'decaf-cappuccino',
  'sencha',
  'matcha-latte',
  'cocoa',
  'ginger-tea',
  'croissant',
  'cinnamon-bun',
  'date-cookie',
  'syrniki',
  'granola',
  'hall',
  'barista',
  'bakery',
  'window',
] as const satisfies readonly string[];

export type PhotoKey = (typeof PHOTO_KEYS)[number];
