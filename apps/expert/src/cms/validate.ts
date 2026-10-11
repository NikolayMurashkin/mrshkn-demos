import type { NumberFieldSingleValidation, TextFieldSingleValidation } from 'payload';
import { PAGE_SLUG_PATTERN } from './consts';

export const validatePageSlug: TextFieldSingleValidation = (value) =>
  PAGE_SLUG_PATTERN.test(value ?? '') || 'Латиница в нижнем регистре, цифры и дефис: «individual», «night-anxiety»';

/** Цена формата уходит в ЮKassa: только целые рубли больше нуля. */
export const validatePrice: NumberFieldSingleValidation = (value) =>
  (Number.isInteger(value) && Number(value) > 0) || 'Целое число рублей больше нуля';
