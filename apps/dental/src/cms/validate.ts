import type { TextFieldSingleValidation } from 'payload';
import { PAGE_SLUG_PATTERN } from './consts';

export const validatePageSlug: TextFieldSingleValidation = (value) =>
  PAGE_SLUG_PATTERN.test(value ?? '') || 'Латиница в нижнем регистре, цифры и дефис: «implants», «lisitsyna»';
