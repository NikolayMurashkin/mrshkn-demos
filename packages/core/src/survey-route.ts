import { getPayload } from 'payload';
import { SURVEY_RATE_LIMIT } from './consts';
import { addressOf } from './lead-route';
import { createRateLimiter } from './lead/rate-limit';
import { parseSurvey } from './survey/parse';
import type { LeadRouteOptions } from './types';

const json = (body: object, status = 200) => Response.json(body, { status });

/**
 * Обработчик анкеты оценки качества: анкета без имени и контакта сохраняется в CMS демо. В Telegram не уходит:
 * отвечать на нее некому. Адрес нужен только лимиту и живет в памяти процесса не дольше окна.
 */
export const createSurveyRoute = ({ config, demo }: LeadRouteOptions) => {
  const limiter = createRateLimiter(SURVEY_RATE_LIMIT);

  return async (request: Request) => {
    if (!limiter.allow(addressOf(request))) {
      return json({ ok: false, reason: 'rate' }, 429);
    }

    const input = await request.json().catch(() => null);
    const result = parseSurvey(input, { demo: demo.slug });

    if (!result.ok) {
      /** Боту отвечаем так же, как человеку: по ответу нельзя понять, что ловушка сработала. */
      return result.reason === 'honeypot' ? json({ ok: true }) : json({ ok: false, reason: result.reason }, 422);
    }

    const payload = await getPayload({ config });

    await payload.create({ collection: 'quality-surveys', data: result.survey });

    return json({ ok: true });
  };
};
