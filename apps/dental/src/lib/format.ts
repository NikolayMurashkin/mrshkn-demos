import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoAddress } from '@mrshkn/demo-core/types';
import { CLINIC_TIME_ZONE } from '../consts';

const amountFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

const dayFormat = new Intl.DateTimeFormat('ru-RU', {
  timeZone: CLINIC_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Сумма в рублях по-русски: разряды с тысяч через неразрывный пробел, дробная часть округляется до рубля. */
export const formatAmount = (amount: number) => amountFormat.format(amount);

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

/** День по Калининграду, «ДД.ММ.ГГГГ»: срок документа врача не сдвигается из-за пояса сервера. */
export const formatDay = (iso: string) => dayFormat.format(new Date(iso));
