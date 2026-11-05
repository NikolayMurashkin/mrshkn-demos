import type { DemoLang } from '@mrshkn/demo-core/types';
import { TICKETS } from '../../consts';
import { formatConcertDate } from '../../lib/concert-date';
import { formatTicketPrice } from '../../lib/price';
import { TEXTS } from '../../texts';
import { BuyLink } from '../BuyLink';
import styles from './Finale.module.scss';

type FinaleProps = {
  lang: DemoLang;
  date: Date;
};

/** Плита `ink` над подписью демо, как подвал DS Kinetic: название концерта крупно, дата и «Купить билет». */
export const Finale = ({ lang, date }: FinaleProps) => {
  const texts = TEXTS[lang].hero;
  const { note } = TEXTS[lang].finale;
  const price = formatTicketPrice(Math.min(...TICKETS.map((ticket) => ticket.price)), lang);

  return (
    <section
      className={styles.finale}
      aria-labelledby="finale-title"
    >
      <div className={styles.main}>
        <div className={styles.head}>
          <p className={styles.when}>
            <time dateTime={date.toISOString()}>{formatConcertDate(date, lang)}</time> · {texts.time}
          </p>
          <h2
            className={styles.title}
            id="finale-title"
            translate="no"
          >
            {texts.title}
          </h2>
        </div>
        <div className={styles.aside}>
          <BuyLink
            variant="primary-on-ink"
            size="lg"
          >
            {texts.buy}
          </BuyLink>
          <p className={styles.note}>{note.replace('{price}', price)}</p>
        </div>
      </div>
    </section>
  );
};
