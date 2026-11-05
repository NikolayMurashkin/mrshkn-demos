import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { PRICE_LOCALES } from '../consts';

/** Цена билета в рублях без копеек по формату языка: «1 500 ₽», «₽1,500»; пробелы внутри цены — неразрывные. */
export const formatTicketPrice = (price: number, lang: DemoLang) =>
  new Intl.NumberFormat(PRICE_LOCALES[lang], {
    style: 'currency',
    currency: 'RUB',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\s/gu, NBSP);
