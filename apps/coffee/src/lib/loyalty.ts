import { LOYALTY, LOYALTY_APP_ENV, LOYALTY_APP_URL_PREFIX } from '../consts';
import type { LoyaltyApp } from '../types';

/**
 * Кнопки Mini App по адресам ботов из окружения. Читается на запрос, а не при импорте: образ один, адрес задается
 * в окружении стенда. Пусто или не `https://` — бота нет, кнопки нет.
 */
export const getLoyaltyApps = (env: NodeJS.ProcessEnv = process.env): LoyaltyApp[] =>
  LOYALTY_APP_ENV.flatMap(({ name, label, messenger }) => {
    const href = env[name]?.trim() ?? '';

    return href.startsWith(LOYALTY_APP_URL_PREFIX) ? [{ href, label, messenger }] : [];
  });

/** Мессенджеры для заголовка и описания: с заданным ботом, а без ботов — все, как в заглушке. */
export const getLoyaltyMessengers = (apps: LoyaltyApp[]) =>
  (apps.length > 0 ? apps : LOYALTY_APP_ENV).map(({ messenger }) => messenger).join(LOYALTY.and);
