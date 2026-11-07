import { BookingLink } from '@/components/BookingLink';
import { BotNote } from '@/components/BotNote';
import { Drops } from '@/components/Drops';
import { HERO, PRICES_HREF } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './Hero.module.scss';

/** Первый экран: капли лака за заголовком, запись и прайс, плита с тремя фактами салона. */
export const Hero = () => (
  <section
    className={styles.hero}
    aria-labelledby="hero-title"
  >
    <Drops />
    <div className={styles.main}>
      <h1
        className={styles.title}
        id="hero-title"
      >
        {HERO.title}
      </h1>
      <p className={styles.lead}>{HERO.lead}</p>
      <div className={styles.actions}>
        <BookingLink />
        <a
          className={styles.prices}
          href={PRICES_HREF}
        >
          {HERO.prices}
        </a>
      </div>
      {DEMO.miniAppUrl && <BotNote className={styles.note} />}
    </div>
    <ul className={styles.facts}>
      {HERO.facts.map((fact) => (
        <li key={fact}>{fact}</li>
      ))}
    </ul>
  </section>
);
