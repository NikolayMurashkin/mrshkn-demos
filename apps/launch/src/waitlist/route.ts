import { LEAD_RATE_LIMIT } from '@mrshkn/demo-core/consts';
import { createRateLimiter } from '@mrshkn/demo-core/lead/rate-limit';
import { addressOf } from '@mrshkn/demo-core/lead-route';
import { getPayload, ValidationError, type Payload } from 'payload';
import { parseWaitlist } from './parse';
import type { WaitlistRouteOptions } from './types';

const json = (body: object, status = 200) => Response.json(body, { status });

const isListed = async (payload: Payload, email: string) =>
  (await payload.count({ collection: 'waitlist', where: { email: { equals: email } } })).totalDocs > 0;

/**
 * Обработчик формы списка ожидания: адрес — в коллекцию `waitlist`, уведомлений нет. Повтор адреса отвечает так же,
 * как новый: ответ «вы уже в списке» выдал бы, чей адрес в нем есть. Лимит и приманка — как у заявки ядра.
 */
export const createWaitlistRoute = ({ config }: WaitlistRouteOptions) => {
  const limiter = createRateLimiter(LEAD_RATE_LIMIT);

  return async (request: Request) => {
    if (!limiter.allow(addressOf(request))) {
      return json({ ok: false, reason: 'rate' }, 429);
    }

    const result = parseWaitlist(await request.json().catch(() => null));

    if (!result.ok) {
      /** Боту отвечаем так же, как человеку: по ответу нельзя понять, что ловушка сработала. */
      return result.reason === 'honeypot' ? json({ ok: true }) : json({ ok: false, reason: result.reason }, 422);
    }

    const payload = await getPayload({ config });

    try {
      await payload.create({ collection: 'waitlist', data: { email: result.email } });
    } catch (error) {
      /** Уникальный индекс отказал — адрес уже записан, в том числе соседним запросом в ту же секунду. */
      if (!(error instanceof ValidationError) || !(await isListed(payload, result.email))) {
        throw error;
      }
    }

    return json({ ok: true });
  };
};
