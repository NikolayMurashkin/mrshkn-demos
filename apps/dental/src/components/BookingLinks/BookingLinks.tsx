import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import { BOOKING } from '@/consts';
import { DEMO } from '@/demo.config';

/** Запись на первом экране, у врача и услуги: Telegram — главная кнопка, MAX — контур. В шапке места на вторую нет. */
export const BookingLinks = () => (
  <BookingButton
    formHref={`#${LEAD_FORM_ID}`}
    miniAppUrl={DEMO.miniAppUrl}
    maxAppUrl={DEMO.maxAppUrl}
    maxLabel={BOOKING.max}
  >
    {BOOKING.telegram}
  </BookingButton>
);
