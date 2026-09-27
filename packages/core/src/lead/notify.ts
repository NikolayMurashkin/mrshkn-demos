import { TELEGRAM_API_FALLBACK } from '../consts';

const envOf = (name: string) => process.env[name]?.trim() ?? '';

/**
 * Уведомление о заявке в Telegram. Без бота и чатов демо просто хранит заявку в CMS — это нормальный режим,
 * а не ошибка; `false` значит «не настроено».
 */
export const notifyTelegram = async (text: string) => {
  const token = envOf('TELEGRAM_BOT_TOKEN');
  const chats = envOf('TELEGRAM_CHAT_IDS')
    .split(',')
    .map((chat) => chat.trim())
    .filter(Boolean);

  if (!token || !chats.length) {
    return false;
  }

  const api = envOf('TELEGRAM_API_URL') || TELEGRAM_API_FALLBACK;

  await Promise.all(
    chats.map(async (chat) => {
      const response = await fetch(`${api}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      });

      if (!response.ok) {
        throw new Error(`Telegram ответил ${response.status}`);
      }
    }),
  );

  return true;
};
