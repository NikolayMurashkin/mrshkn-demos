import { NBSP } from '@mrshkn/demo-core/consts';
import type { Plan } from '../types';

const GROUPED = new Intl.NumberFormat('ru-RU', { useGrouping: 'always', maximumFractionDigits: 0 });

/** Разряды с тысяч и в четырехзначных; разделитель — всегда NBSP, как у цены в DS: ICU может отдать узкий U+202F. */
const groupDigits = (amount: number) => GROUPED.format(amount).replace(/\s/g, NBSP);

/** Цена тарифа: «2 900 ₽», «от 14 900 ₽»; у бесплатного — «0 ₽». */
export const formatPlanPrice = ({ amount, from }: Pick<Plan, 'amount' | 'from'>) =>
  `${from ? `от${NBSP}` : ''}${groupDigits(amount)}${NBSP}₽`;
