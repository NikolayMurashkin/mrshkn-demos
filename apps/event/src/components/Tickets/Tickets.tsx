import type { DemoLang } from '@mrshkn/demo-core/types';
import { TICKETS } from '../../consts';
import { formatTicketPrice } from '../../lib/price';
import { TEXTS } from '../../texts';
import { BuyLink } from '../BuyLink';
import { Section } from '../Section';
import styles from './Tickets.module.scss';

type TicketsProps = {
  lang: DemoLang;
};

/** Три категории по возрастанию цены, у каждой — своя кнопка на Афишу. */
export const Tickets = ({ lang }: TicketsProps) => {
  const texts = TEXTS[lang].tickets;

  return (
    <Section
      id="tickets"
      title={texts.title}
    >
      <ul className={styles.list}>
        {TICKETS.map(({ id, price }) => (
          <li
            key={id}
            className={styles.card}
          >
            <h3 className={styles.name}>{texts.items[id].name}</h3>
            <p className={styles.price}>{formatTicketPrice(price, lang)}</p>
            <p className={styles.text}>{texts.items[id].text}</p>
            <BuyLink className={styles.buy}>{texts.buy}</BuyLink>
          </li>
        ))}
      </ul>
      <p className={styles.note}>{texts.note}</p>
    </Section>
  );
};
