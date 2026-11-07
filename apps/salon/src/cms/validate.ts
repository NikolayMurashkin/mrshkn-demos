import type { NumberFieldSingleValidation, TextFieldSingleValidation } from 'payload';
import { SLUG_PATTERN } from './consts';

export const validateSlug: TextFieldSingleValidation = (value) =>
  SLUG_PATTERN.test(value ?? '') || 'Латиница в нижнем регистре, цифры и дефис: «alina», «gel-manicure»';

/** Цена «от» — целые рубли больше нуля: копеек в прайсе салона нет. */
export const validatePrice: NumberFieldSingleValidation = (value) =>
  (typeof value === 'number' && Number.isInteger(value) && value > 0) || 'Целое число рублей больше нуля';

/** Стаж мастера — целое число лет. */
export const validateYears: NumberFieldSingleValidation = (value) =>
  (typeof value === 'number' && Number.isInteger(value) && value > 0) || 'Целое число лет больше нуля';
