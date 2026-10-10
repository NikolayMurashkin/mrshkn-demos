import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatAmount } from '../../apps/dental/src/lib/format';

describe('демо «Клиника»: сумма через Intl.NumberFormat', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it.each([0, 990, 1500, 125000])('совпадение на наборе сумм: %i', (amount) => {
    expect(formatAmount(amount)).toBe(new Intl.NumberFormat('ru-RU').format(amount));
  });

  it('сумма берется из Intl.NumberFormat с локалью ru-RU', async () => {
    const locales: unknown[] = [];

    // обычная функция, возвращающая объект: работает и с `new`, и без него
    const FakeNumberFormat = function (requested?: string | string[]) {
      locales.push(...(Array.isArray(requested) ? requested : [requested]));

      return { format: (value: number | bigint) => `fake:${value}` };
    };

    // свойства Intl неперечисляемые: копия через дескрипторы, а не spread
    const fakeIntl = Object.defineProperties({}, Object.getOwnPropertyDescriptors(Intl));
    Object.defineProperty(fakeIntl, 'NumberFormat', { value: FakeNumberFormat, configurable: true, writable: true });
    vi.stubGlobal('Intl', fakeIntl);
    vi.resetModules();

    const { formatAmount: stubbedFormatAmount } = await import('../../apps/dental/src/lib/format');

    expect(stubbedFormatAmount(1500)).toBe('fake:1500');
    expect(locales).toContain('ru-RU');
  });
});
