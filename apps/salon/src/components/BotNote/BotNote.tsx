import { BOOKING_FORM_HREF, BOT_NOTE, NO_TELEGRAM } from '@/consts';
import styles from './BotNote.module.scss';

type BotNoteProps = {
  className: string;
};

/** Подпись под записью в бота: куда ведет кнопка и ссылка на форму заявки для гостей без Telegram. */
export const BotNote = ({ className }: BotNoteProps) => (
  <p className={className}>
    {BOT_NOTE} {NO_TELEGRAM.lead}{' '}
    <a
      className={styles.link}
      href={BOOKING_FORM_HREF}
    >
      {NO_TELEGRAM.link}
    </a>
  </p>
);
