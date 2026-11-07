import { SERVICE_CATEGORIES } from '../seed/data';

/** Варианты поля «Направление»: те же slug, что якоря групп прайса. */
export const CATEGORY_OPTIONS = SERVICE_CATEGORIES.map(({ slug, name }) => ({ value: slug, label: name }));
