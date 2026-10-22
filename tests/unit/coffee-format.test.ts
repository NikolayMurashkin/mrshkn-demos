import { describe, expect, it } from 'vitest';
import { addressText, formatPrice, hoursRows, phoneHref } from '../../apps/coffee/src/lib/format';

describe('демо «Кофейня»: часы работы — hoursRows', () => {
  it('H1: дни и время через короткое тире, ведущий ноль часа снят', () => {
    expect(hoursRows(['Mo-Fr 08:00-21:00', 'Sa-Su 09:00-21:00'])).toEqual([
      { days: 'пн–пт', time: '8:00–21:00' },
      { days: 'сб–вс', time: '9:00–21:00' },
    ]);
  });

  it('H2: один день — без тире в днях, ноль у двузначного часа не снимается', () => {
    expect(hoursRows(['Su 10:00-18:00'])).toEqual([{ days: 'вс', time: '10:00–18:00' }]);
  });

  it('H3: без часов — пустая таблица', () => {
    expect(hoursRows([])).toEqual([]);
  });
});

describe('демо «Кофейня»: телефон, цена, адрес', () => {
  it('P1: ссылка для звонка — номер без пробелов и дефисов с плюсом', () => {
    expect(phoneHref('+7 952 000-00-21')).toBe('tel:+79520000021');
  });

  it('P2: цена — разряды с тысяч и знак рубля через неразрывный пробел', () => {
    expect(formatPrice(250)).toBe('250 ₽');
    expect(formatPrice(1250)).toBe('1 250 ₽');
  });

  it('P3: адрес — город, затем улица; страна не выводится', () => {
    expect(
      addressText({
        addressLocality: 'Калининград',
        streetAddress: 'ул. Генерала Галицкого, 12',
        addressCountry: 'RU',
      }),
    ).toBe('Калининград, ул. Генерала Галицкого, 12');
  });
});
