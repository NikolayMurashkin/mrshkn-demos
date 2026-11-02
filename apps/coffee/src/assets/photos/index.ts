import type { StaticImageData } from 'next/image';
import type { PhotoKey } from './keys';

/**
 * Карта кадров демо: ключ — значение поля `photo` в CMS, файл — статический импорт из этой папки. Новый кадр — ключ
 * в `keys.ts`, файл сюда, строка в `docs/photo-credits.md`: по жалобе его находят и снимают. Конфигу Payload карту
 * не импортировать — только `keys.ts`.
 */
export const PHOTOS: Record<PhotoKey, StaticImageData> = {};
