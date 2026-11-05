import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Lang = 'ru' | 'en';

type Ticket = { id: string; price: number };

type ConstsModule = { TICKETS: Ticket[] };

type PriceModule = { formatTicketPrice: (price: number, lang: Lang) => string };

const EVENT_SRC = path.resolve(import.meta.dirname, '../../apps/event/src');

/** Модуль демо «Концерт»: пока демо не развернуто, тест падает на assert, а не на сборке файла. */
const importEvent = async <T>(relative: string): Promise<T> => {
  const file = path.join(EVENT_SRC, relative);

  expect(existsSync(file), `нет apps/event/src/${relative}`).toBe(true);

  return (await import(/* @vite-ignore */ file)) as T;
};

describe('билеты: три категории и формат цены', () => {
  it('P1: TICKETS — балкон 1500, партер 2500, первые ряды 3500, строго по возрастанию цены', async () => {
    const { TICKETS } = await importEvent<ConstsModule>('consts.ts');
    const prices = TICKETS.map(({ price }) => price);

    expect(TICKETS.map(({ id }) => id)).toEqual(['balcony', 'parterre', 'front']);
    expect(prices).toEqual([1500, 2500, 3500]);

    for (let index = 1; index < prices.length; index += 1) {
      expect(prices[index], `цена ${index + 1}-й категории выше предыдущей`).toBeGreaterThan(prices[index - 1]);
    }
  });

  it('P2: ru — «1 500 ₽», «2 500 ₽», «3 500 ₽» с неразрывными пробелами', async () => {
    const { formatTicketPrice } = await importEvent<PriceModule>('lib/price.ts');

    expect(formatTicketPrice(1500, 'ru')).toBe('1\u00a0500\u00a0₽');
    expect(formatTicketPrice(2500, 'ru')).toBe('2\u00a0500\u00a0₽');
    expect(formatTicketPrice(3500, 'ru')).toBe('3\u00a0500\u00a0₽');
  });

  it('P3: en — «₽1,500», «₽2,500», «₽3,500»', async () => {
    const { formatTicketPrice } = await importEvent<PriceModule>('lib/price.ts');

    expect(formatTicketPrice(1500, 'en')).toBe('₽1,500');
    expect(formatTicketPrice(2500, 'en')).toBe('₽2,500');
    expect(formatTicketPrice(3500, 'en')).toBe('₽3,500');
  });
});
