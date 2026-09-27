import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoAddress } from '@mrshkn/demo-core/types';

/** Сумма в рублях: разряды через неразрывный пробел с тысяч — в колонке цен «1 500» и «18 000» читаются ровно. */
export const formatAmount = (amount: number) => String(Math.round(amount)).replace(/\B(?=(\d{3})+$)/g, NBSP);

export const formatPrice = (price: number, from = false) => `${from ? `от${NBSP}` : ''}${formatAmount(price)}${NBSP}₽`;

export const practiceSinceText = (year: number) => `В${NBSP}профессии с${NBSP}${year}${NBSP}года`;

/** Ссылка для звонка: «+7 952 173-02-30» → `tel:+79521730230`. */
export const phoneHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`;

export const addressText = ({ addressLocality, streetAddress }: DemoAddress) => `${addressLocality}, ${streetAddress}`;

/** Инициалы для плашки на месте фото: имя и фамилия из «Фамилия Имя Отчество». */
export const initialsOf = (fullName: string) => {
  const [surname = '', name = ''] = fullName.trim().split(/\s+/);

  return `${name.charAt(0)}${surname.charAt(0)}`;
};
