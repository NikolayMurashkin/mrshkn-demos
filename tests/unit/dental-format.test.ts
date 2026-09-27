import { describe, expect, it } from 'vitest';
import { formatPrice, phoneHref } from '../../apps/dental/src/lib/format';

describe('демо «Клиника»: форматирование', () => {
  it('ссылка для звонка — номер без пробелов и дефисов с плюсом', () => {
    expect(phoneHref('+7 952 173-02-30')).toBe('tel:+79521730230');
  });

  it('цена — разряды с тысяч через неразрывный пробел, «от» не отрывается от суммы', () => {
    expect(formatPrice(700)).toBe('700 ₽');
    expect(formatPrice(1500)).toBe('1 500 ₽');
    expect(formatPrice(180000, true)).toBe('от 180 000 ₽');
  });
});
