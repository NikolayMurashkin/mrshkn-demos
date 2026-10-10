import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoAddress, DemoLang } from '@mrshkn/demo-core/types';
import { typograph } from '@mrshkn/demo-core/typograph';
import { CURRENCIES, LANGS, NUMBER_LOCALES } from '../consts';
import { TEXTS } from '../texts';

export const isDemoLang = (value: string): value is DemoLang => (LANGS as string[]).includes(value);

/** Адрес страницы на языке: `/ru`, `/en/privacy`. */
export const langHref = (lang: DemoLang, path = '') => `/${lang}${path}`;

export const policyHref = (lang: DemoLang) => langHref(lang, '/privacy');

/** Цена «от» по правилам языка, без копеек: «от 18 000 ₽», «from $250». */
export const formatPrice = (price: number, lang: DemoLang) => {
  const amount = new Intl.NumberFormat(NUMBER_LOCALES[lang], {
    style: 'currency',
    currency: CURRENCIES[lang],
    maximumFractionDigits: 0,
  }).format(price);

  return `${TEXTS[lang].card.from}${NBSP}${amount}`;
};

/** Типограф для текстов из CMS: короткие слова и тире есть только в русских правилах. */
export const typeset = (text: string, lang: DemoLang) => (lang === 'ru' ? typograph(text) : text);

/** Срок работы: число не отрывается от единицы — «1–2 дня», «40 min» не делятся на две строки. */
export const termText = (term: string, lang: DemoLang) => typeset(term, lang).replace(/(\d) /g, `$1${NBSP}`);

/** Адрес по обычаю страны: «Калининград, ул. Карданная, 12», «1250 Camshaft Ave, Columbus, OH 43215». */
export const addressText = ({ streetAddress, addressLocality, postalCode }: DemoAddress, lang: DemoLang) =>
  lang === 'ru'
    ? `${addressLocality}, ${streetAddress}`
    : `${streetAddress}, ${[addressLocality, postalCode].filter(Boolean).join(' ')}`;

/** Ссылка для звонка: «+7 000 000-00-00» → `tel:+70000000000`. */
export const phoneHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`;
