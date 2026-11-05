import type { StaticImageData } from 'next/image';
import galleryBass from './gallery-bass.jpg';
import galleryDrums from './gallery-drums.jpg';
import galleryPiano from './gallery-piano.jpg';
import gallerySaxophones from './gallery-saxophones.jpg';
import gallerySilhouettes from './gallery-silhouettes.jpg';
import galleryStage from './gallery-stage.jpg';
import poster from './poster.jpg';
import quartet from './quartet.jpg';
import venue from './venue.jpg';
import type { PhotoKey } from './keys';

/**
 * Карта кадров демо: стоковые кадры из этой папки статическими импортами. Новый кадр — ключ в `keys.ts`, файл сюда,
 * строка в `docs/photo-credits.md`: по жалобе его находят и снимают.
 */
export const PHOTOS: Record<PhotoKey, StaticImageData> = {
  poster,
  quartet,
  venue,
  'gallery-stage': galleryStage,
  'gallery-piano': galleryPiano,
  'gallery-bass': galleryBass,
  'gallery-drums': galleryDrums,
  'gallery-saxophones': gallerySaxophones,
  'gallery-silhouettes': gallerySilhouettes,
};
