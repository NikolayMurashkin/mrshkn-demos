import { DemoReviews } from '@mrshkn/demo-core/components/DemoReviews';
import { mapWidgetUrl } from '@mrshkn/demo-core/map';
import { paragraphs, typograph } from '@mrshkn/demo-core/typograph';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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

describe('типограф: неразрывный дефис и инициалы', () => {
  it.each([
    ['из-за', 'из\u2011за'],
    ['из-под', 'из\u2011под'],
    ['кто-то', 'кто\u2011то'],
    ['что-нибудь', 'что\u2011нибудь'],
    ['как-либо', 'как\u2011либо'],
    ['кое-что', 'кое\u2011что'],
    ['по-моему', 'по\u2011моему'],
  ])('короткие слова через дефис — неразрывный дефис: %s', (word, expected) => {
    expect(typograph(word)).toBe(expected);
  });

  it('с заглавной и в предложении; короткое слово после дефиса держит свой пробел', () => {
    expect(typograph('Из-за дождя мы опоздали')).toBe('Из\u2011за\u00a0дождя мы опоздали');
  });

  it.each(['научно-популярный', 'северо-западный', 'Демо-проект', 'онлайн-запись'])(
    'длинные составные слова — без изменений: %s',
    (word) => {
      expect(typograph(word)).toBe(word);
    },
  );

  it('несколько дефисов в слове — каждый по своим соседям', () => {
    expect(typograph('Ростов-на-Дону')).toBe('Ростов\u2011на\u2011Дону');
  });

  it('латиница — по тому же правилу', () => {
    expect(typograph('Write to e-mail')).toBe('Write to e\u2011mail');
  });

  it('цифры и дефис с пробелами — без изменений', () => {
    expect(typograph('10-15 минут')).toBe('10-15 минут');
    expect(typograph('да - нет')).toBe('да - нет');
  });

  it('неразрывный пробел перед инициалом', () => {
    expect(typograph('Анна К.')).toBe('Анна\u00a0К.');
    expect(typograph('Вера А. Лисицына')).toBe('Вера\u00a0А. Лисицына');
    expect(typograph('Emily R.')).toBe('Emily\u00a0R.');
  });

  it('два инициала подряд', () => {
    expect(typograph('А. С. Пушкин')).toBe('А.\u00a0С. Пушкин');
  });

  it('не инициал — без изменений', () => {
    expect(typograph('Вера Алексеевна')).toBe('Вера Алексеевна');
    expect(typograph('Поставка из США.')).toBe('Поставка из\u00a0США.');
  });

  it('висячий дефис перед пробелом — без изменений', () => {
    expect(typograph('до- и послеоперационный')).toBe('до- и\u00a0послеоперационный');
  });

  it('заглавная с точкой, за которой буква, — не инициал', () => {
    expect(typograph('Сначала осмотр. Т.е. без спешки')).toBe('Сначала осмотр. Т.е. без\u00a0спешки');
  });

  it('подпись отзыва в блоке отзывов ядра — с неразрывным пробелом перед инициалом', () => {
    const html = renderToStaticMarkup(
      createElement(DemoReviews, { title: 'Отзывы', reviews: [{ author: 'Андрей К.', text: 'Починили быстро.' }] }),
    );

    expect(html).toContain('Андрей\u00a0К.</cite>');
  });

  it('повторный вызов строку не меняет; все правила вместе', () => {
    const once = typograph('Из-за дождя Анна К. — по-моему, кто-то в саду');

    expect(once).toBe('Из\u2011за\u00a0дождя Анна\u00a0К.\u00a0— по\u2011моему, кто\u2011то в\u00a0саду');
    expect(typograph(once)).toBe(once);
  });

  it('paragraphs применяет новые правила к каждому абзацу', () => {
    expect(paragraphs('Из-за дождя.\n\nАнна К.')).toEqual(['Из\u2011за\u00a0дождя.', 'Анна\u00a0К.']);
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
