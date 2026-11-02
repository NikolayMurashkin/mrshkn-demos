import type { StaticImageData } from 'next/image';
import type { PhotoKey } from './keys';
import espressoPhoto from './espresso.jpg';
import americanoPhoto from './americano.jpg';
import cappuccinoPhoto from './cappuccino.jpg';
import flatWhitePhoto from './flat-white.jpg';
import oatLattePhoto from './oat-latte.jpg';
import rafPhoto from './raf.jpg';
import decafCappuccinoPhoto from './decaf-cappuccino.jpg';
import senchaPhoto from './sencha.jpg';
import matchaLattePhoto from './matcha-latte.jpg';
import cocoaPhoto from './cocoa.jpg';
import gingerTeaPhoto from './ginger-tea.jpg';
import croissantPhoto from './croissant.jpg';
import cinnamonBunPhoto from './cinnamon-bun.jpg';
import dateCookiePhoto from './date-cookie.jpg';
import syrnikiPhoto from './syrniki.jpg';
import granolaPhoto from './granola.jpg';
import hallPhoto from './hall.jpg';
import baristaPhoto from './barista.jpg';
import bakeryPhoto from './bakery.jpg';
import windowPhoto from './window.jpg';

/**
 * Карта кадров демо: ключ — значение поля `photo` в CMS, файл — статический импорт из этой папки. Новый кадр — ключ
 * в `keys.ts`, файл сюда, строка в `docs/photo-credits.md`: по жалобе его находят и снимают. Конфигу Payload карту
 * не импортировать — только `keys.ts`.
 */
export const PHOTOS: Record<PhotoKey, StaticImageData> = {
  espresso: espressoPhoto,
  americano: americanoPhoto,
  cappuccino: cappuccinoPhoto,
  'flat-white': flatWhitePhoto,
  'oat-latte': oatLattePhoto,
  raf: rafPhoto,
  'decaf-cappuccino': decafCappuccinoPhoto,
  sencha: senchaPhoto,
  'matcha-latte': matchaLattePhoto,
  cocoa: cocoaPhoto,
  'ginger-tea': gingerTeaPhoto,
  croissant: croissantPhoto,
  'cinnamon-bun': cinnamonBunPhoto,
  'date-cookie': dateCookiePhoto,
  syrniki: syrnikiPhoto,
  granola: granolaPhoto,
  hall: hallPhoto,
  barista: baristaPhoto,
  bakery: bakeryPhoto,
  window: windowPhoto,
};
