import { mapWidgetUrl } from '@mrshkn/demo-core/map';
import { paragraphs, typograph } from '@mrshkn/demo-core/typograph';
import { describe, expect, it } from 'vitest';

describe('типограф текстов из CMS', () => {
  it('ставит неразрывный пробел после коротких слов и перед тире', () => {
    expect(typograph('Лечим зубы в клинике и дома — по плану')).toBe('Лечим зубы в клинике и дома — по плану');
  });

  it('узнает короткое слово в начале строки, после кавычки и с заглавной', () => {
    expect(typograph('В кабинете «на месте»')).toBe('В кабинете «на месте»');
  });

  it('не трогает короткие слоги внутри слов', () => {
    expect(typograph('Коронка из циркония')).toBe('Коронка из циркония');
    expect(typograph('ванна')).toBe('ванна');
  });

  it('делит поле на абзацы по пустой строке и выбрасывает пустые', () => {
    expect(paragraphs('Первый абзац.\n\n\nВторой и третий.\n  \n')).toEqual(['Первый абзац.', 'Второй и третий.']);
    expect(paragraphs(null)).toEqual([]);
  });
});

describe('карта по нажатию', () => {
  it('ставит центр и метку виджета Яндекс Карт на точку, долготой вперед', () => {
    const url = new URL(mapWidgetUrl({ latitude: 54.7518, longitude: 20.4705 }));

    expect(`${url.origin}${url.pathname}`).toBe('https://yandex.ru/map-widget/v1/');
    expect(url.searchParams.get('ll')).toBe('20.4705,54.7518');
    expect(url.searchParams.get('pt')).toBe('20.4705,54.7518,pm2rdm');
    expect(url.searchParams.get('z')).toBe('16');
  });
});
