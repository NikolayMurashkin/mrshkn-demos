import { RATE_LIMIT_SWEEP_MS } from '../consts';
import type { RateLimiterOptions } from '../types';

/**
 * Скользящее окно по адресу. Память живет в процессе: каждое демо крутится одним контейнером. Адрес, который
 * не обращался дольше окна, стирается на каждом вызове и по таймеру: политика обещает хранить его около 10 минут.
 */
export const createRateLimiter = ({ limit, windowMs }: RateLimiterOptions) => {
  const hits = new Map<string, number[]>();

  const prune = (now: number) => {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) {
        hits.delete(key);
      }
    }
  };

  /** Таймер не держит процесс: без него сервер и тесты завершались бы как прежде. */
  setInterval(() => prune(Date.now()), Math.min(windowMs, RATE_LIMIT_SWEEP_MS)).unref?.();

  return {
    allow(key: string, now: number = Date.now()) {
      prune(now);

      const fresh = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

      if (fresh.length >= limit) {
        hits.set(key, fresh);

        return false;
      }

      hits.set(key, [...fresh, now]);

      return true;
    },
    /** Сколько адресов лимитер сейчас помнит. */
    size() {
      return hits.size;
    },
  };
};
