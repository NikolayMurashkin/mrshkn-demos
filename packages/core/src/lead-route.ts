import { getPayload } from 'payload';
import { LEAD_RATE_LIMIT } from './consts';
import { notifyTelegram } from './lead/notify';
import { formatLead, parseLead } from './lead/parse';
import { createRateLimiter } from './lead/rate-limit';
import type { LeadRouteOptions } from './types';

const json = (body: object, status = 200) => Response.json(body, { status });

/**
 * Берется последний адрес в `x-forwarded-for`: первый присылает сам клиент, и лимит обходился бы одной
 * строкой заголовка. Последний дописывает наш прокси.
 */
const addressOf = (request: Request) =>
  request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((address) => address.trim())
    .filter(Boolean)
    .at(-1) ||
  request.headers.get('x-real-ip') ||
  'unknown';

const pageOf = (request: Request) => {
  try {
    return new URL(request.headers.get('referer') ?? '').pathname;
  } catch {
    return '/';
  }
};

/**
 * Обработчик формы заявки: заявка сохраняется в CMS демо, уведомление уходит в Telegram, если бот настроен.
 * Заявка потеряна, только если не записалась в базу; упавшее уведомление пишется в лог.
 */
export const createLeadRoute = ({ config, demo }: LeadRouteOptions) => {
  const limiter = createRateLimiter(LEAD_RATE_LIMIT);

  return async (request: Request) => {
    if (!limiter.allow(addressOf(request))) {
      return json({ ok: false, reason: 'rate' }, 429);
    }

    const input = await request.json().catch(() => null);
    const result = parseLead(input, { demo: demo.slug, page: pageOf(request) });

    if (!result.ok) {
      /** Боту отвечаем так же, как человеку: по ответу нельзя понять, что ловушка сработала. */
      return result.reason === 'honeypot' ? json({ ok: true }) : json({ ok: false, reason: result.reason }, 422);
    }

    const payload = await getPayload({ config });

    await payload.create({ collection: 'leads', data: result.lead });

    try {
      await notifyTelegram(formatLead(result.lead));
    } catch (error) {
      console.error('Уведомление о заявке не ушло в Telegram:', error);
    }

    return json({ ok: true });
  };
};
