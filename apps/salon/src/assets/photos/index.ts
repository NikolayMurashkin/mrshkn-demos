import type { StaticImageData } from 'next/image';
import type { PhotoKey } from './keys';
import masterAlinaPhoto from './master-alina.jpg';
import masterDariaPhoto from './master-daria.jpg';
import masterMarinaPhoto from './master-marina.jpg';
import masterEvaPhoto from './master-eva.jpg';
import masterOlgaPhoto from './master-olga.jpg';
import workAlina1Photo from './work-alina-1.jpg';
import workAlina2Photo from './work-alina-2.jpg';
import workAlina3Photo from './work-alina-3.jpg';
import workDaria1Photo from './work-daria-1.jpg';
import workDaria2Photo from './work-daria-2.jpg';
import workDaria3Photo from './work-daria-3.jpg';
import workMarina1Photo from './work-marina-1.jpg';
import workMarina2Photo from './work-marina-2.jpg';
import workMarina3Photo from './work-marina-3.jpg';
import workEva1Photo from './work-eva-1.jpg';
import workEva2Photo from './work-eva-2.jpg';
import workEva3Photo from './work-eva-3.jpg';
import workOlga1Photo from './work-olga-1.jpg';
import workOlga2Photo from './work-olga-2.jpg';
import workOlga3Photo from './work-olga-3.jpg';
import salonInteriorPhoto from './salon-interior.jpg';

/**
 * Карта кадров демо: ключ — значение поля `photo` в CMS, файл — статический импорт из этой папки. Новый кадр — ключ
 * в `keys.ts`, файл сюда, строка в `docs/photo-credits.md`: по жалобе его находят и снимают. Конфигу Payload карту
 * не импортировать — только `keys.ts`.
 */
export const PHOTOS: Record<PhotoKey, StaticImageData> = {
  'master-alina': masterAlinaPhoto,
  'master-daria': masterDariaPhoto,
  'master-marina': masterMarinaPhoto,
  'master-eva': masterEvaPhoto,
  'master-olga': masterOlgaPhoto,
  'work-alina-1': workAlina1Photo,
  'work-alina-2': workAlina2Photo,
  'work-alina-3': workAlina3Photo,
  'work-daria-1': workDaria1Photo,
  'work-daria-2': workDaria2Photo,
  'work-daria-3': workDaria3Photo,
  'work-marina-1': workMarina1Photo,
  'work-marina-2': workMarina2Photo,
  'work-marina-3': workMarina3Photo,
  'work-eva-1': workEva1Photo,
  'work-eva-2': workEva2Photo,
  'work-eva-3': workEva3Photo,
  'work-olga-1': workOlga1Photo,
  'work-olga-2': workOlga2Photo,
  'work-olga-3': workOlga3Photo,
  'salon-interior': salonInteriorPhoto,
};
