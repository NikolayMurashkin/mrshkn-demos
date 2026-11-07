import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { POLICY_HREF } from '@mrshkn/demo-core/consts';
import type { Metadata } from 'next';
import { BookingLink } from '@/components/BookingLink';
import { Drops } from '@/components/Drops';
import { PageIntro } from '@/components/PageIntro';
import { BOOKING_FORM_ID, BOOKING_PAGE, BOT_NOTE } from '@/consts';
import { DEMO } from '@/demo.config';
import shared from '../page.module.scss';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: BOOKING_PAGE.title,
  description: BOOKING_PAGE.description,
};

/**
 * Запись: бот салона и форма заявки ядра для тех, у кого нет Telegram. Без бота остается только форма — плиты
 * «Через Telegram» нет. Плиты записи над подвалом здесь нет: страница сама — запись.
 */
const BookingPage = () => (
  <main className={shared.page}>
    <PageIntro
      title={BOOKING_PAGE.title}
      lead={DEMO.miniAppUrl ? BOOKING_PAGE.bot.lead : BOOKING_PAGE.form.lead}
    />
    <div className={DEMO.miniAppUrl ? styles.cards : styles.single}>
      {DEMO.miniAppUrl && (
        <section
          className={styles.bot}
          aria-labelledby="booking-bot-title"
        >
          <Drops variant="small" />
          <h2
            className={styles.title}
            id="booking-bot-title"
          >
            {BOOKING_PAGE.bot.title}
          </h2>
          <p className={styles.note}>{BOT_NOTE}</p>
          <BookingLink />
        </section>
      )}
      <section
        className={styles.card}
        id={BOOKING_FORM_ID}
        aria-labelledby="booking-form-title"
      >
        <h2
          className={styles.title}
          id="booking-form-title"
        >
          {DEMO.miniAppUrl ? BOOKING_PAGE.form.title : BOOKING_PAGE.form.titleAlone}
        </h2>
        <p className={styles.note}>{BOOKING_PAGE.form.note}</p>
        <div className={styles.form}>
          <LeadForm policyHref={POLICY_HREF} />
        </div>
      </section>
    </div>
  </main>
);

export default BookingPage;
