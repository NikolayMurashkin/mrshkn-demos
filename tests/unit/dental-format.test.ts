import { describe, expect, it } from 'vitest';
import { formatPrice, initialsOf, phoneHref } from '../../apps/dental/src/lib/format';

describe('демо «Клиника»: форматирование', () => {
  it('ссылка для звонка — номер без пробелов и дефисов с плюсом', () => {
    expect(phoneHref('+7 952 173-02-30')).toBe('tel:+79521730230');
  });

  it('цена — разряды с тысяч через неразрывный пробел, «от» не отрывается от суммы', () => {
    expect(formatPrice(700)).toBe('700 ₽');
    expect(formatPrice(1500)).toBe('1 500 ₽');
    expect(formatPrice(180000, true)).toBe('от 180 000 ₽');
  });

  it('инициалы — первая буква имени, затем фамилии из «Фамилия Имя Отчество»', () => {
    expect(initialsOf('Лисицына Вера Андреевна')).toBe('ВЛ');
  });

  it('инициалы — лишние пробелы по краям и между словами не мешают', () => {
    expect(initialsOf('  Лисицына   Вера\tАндреевна  ')).toBe('ВЛ');
  });

  it('инициалы — из одного слова только буква фамилии', () => {
    expect(initialsOf('Лисицына')).toBe('Л');
  });
});
