import type { StaticImageData } from 'next/image';
import { PHOTOS } from '../assets/photos';
import type { PhotoKey } from '../assets/photos/keys';

/** Кадр по ключу из поля `photo` CMS: пусто или ключа нет в карте (кадр сняли после правки в админке) — без фото. */
export const photoOf = (key: string | null | undefined): StaticImageData | undefined =>
  key && Object.hasOwn(PHOTOS, key) ? PHOTOS[key as PhotoKey] : undefined;
