import type { DemoLang } from '@mrshkn/demo-core/types';
import { LANGS } from '../consts';

export const isDemoLang = (value: string): value is DemoLang => (LANGS as string[]).includes(value);

/** Адрес страницы на языке: `/ru`, `/en/privacy`. */
export const langHref = (lang: DemoLang, path = '') => `/${lang}${path}`;

export const policyHref = (lang: DemoLang) => langHref(lang, '/privacy');
