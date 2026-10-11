/** Формат в форме записи: подписи уже собраны на сервере — «50 минут · онлайн или очно», «4 500 ₽». */
export type BookingFormFormat = {
  slug: string;
  title: string;
  meta: string;
  price: string;
};

export type BookingFormStatus = 'idle' | 'sending' | 'invalid' | 'failed';
