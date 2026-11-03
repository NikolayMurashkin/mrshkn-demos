import type { StaticImageData } from 'next/image';
import berezhnoyPhoto from './berezhnoy.jpg';
import cabinetPhoto from './cabinet.jpg';
import instrumentsPhoto from './instruments.jpg';
import interiorPhoto from './interior.jpg';
import koltsovaPhoto from './koltsova.jpg';
import type { PhotoKey } from './keys';
import lisitsynaPhoto from './lisitsyna.jpg';
import mezentsevaPhoto from './mezentseva.jpg';
import shumeykoPhoto from './shumeyko.jpg';
import tarnovskyPhoto from './tarnovsky.jpg';
import vetrovaPhoto from './vetrova.jpg';
import waitingPhoto from './waiting.jpg';

/**
 * Карта кадров демо: ключ — значение поля `photo` в CMS, файл — статический импорт из этой папки. Новый кадр — ключ
 * в `keys.ts`, файл сюда, строка в `docs/photo-credits.md`: по жалобе его находят и снимают. Конфигу Payload карту
 * не импортировать — только `keys.ts`.
 */
export const PHOTOS: Record<PhotoKey, StaticImageData> = {
  lisitsyna: lisitsynaPhoto,
  berezhnoy: berezhnoyPhoto,
  koltsova: koltsovaPhoto,
  shumeyko: shumeykoPhoto,
  vetrova: vetrovaPhoto,
  tarnovsky: tarnovskyPhoto,
  mezentseva: mezentsevaPhoto,
  interior: interiorPhoto,
  waiting: waitingPhoto,
  cabinet: cabinetPhoto,
  instruments: instrumentsPhoto,
};
