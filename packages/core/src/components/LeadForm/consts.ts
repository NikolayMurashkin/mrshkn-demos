import type { LeadFormStatus } from '../../types';

export const STATUS_TEXT: Record<Exclude<LeadFormStatus, 'idle' | 'sending'>, string> = {
  sent: 'Заявка отправлена. Это демо-сайт: ответит студия MRSHKN.',
  invalid: 'Проверьте имя, способ связи и согласие на обработку данных.',
  failed: 'Не получилось отправить заявку. Попробуйте еще раз через минуту.',
};
