import type { StaticImageData } from 'next/image';
import { PHOTOS } from '../assets/photos';
import type { PhotoKey } from '../assets/photos/keys';

const isPhotoKey = (key: string): key is PhotoKey => Object.hasOwn(PHOTOS, key);

/** Кадр по ключу из поля `photo` CMS: пусто или ключа нет в карте — кадра нет, а не пустая плита. */
export const photoOf = (key: string | null | undefined): StaticImageData | null =>
  key && isPhotoKey(key) ? PHOTOS[key] : null;
