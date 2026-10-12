import type { NumberFieldSingleValidation, TextFieldSingleValidation } from 'payload';
import { MENU_SLUG_PATTERN } from './consts';

export const validateMenuSlug: TextFieldSingleValidation = (value) =>
  MENU_SLUG_PATTERN.test(value ?? '') || 'Латиница в нижнем регистре, цифры и дефис: «flat-white», «syrniki»';

/** Цена в меню — целые рубли: копеек в меню кофейни нет. */
export const validatePrice: NumberFieldSingleValidation = (value) =>
  (typeof value === 'number' && Number.isInteger(value) && value > 0) || 'Целое число рублей больше нуля';
