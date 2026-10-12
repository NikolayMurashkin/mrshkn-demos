import { HERO, LOYALTY_HREF, MENU_HREF } from '../../consts';
import { Arrow } from '../Arrow';
import { Star } from '../Star';
import styles from './Hero.module.scss';

/** Первый экран — стикерборд: заголовок и кнопки, рядом три стикера-обещания; последний ведет в лояльность. */
export const Hero = () => (
  <section
    className={styles.hero}
    aria-labelledby="hero-title"
  >
    <div className={styles.content}>
      <h1
        className={styles.title}
        id="hero-title"
      >
        {HERO.title}
      </h1>
      <p className={styles.lead}>{HERO.lead}</p>
      <div className={styles.actions}>
        <a
          className={styles.primary}
          href={MENU_HREF}
        >
          {HERO.menu}
          <Arrow />
        </a>
        <a
          className={styles.secondary}
          href="#contacts"
        >
          {HERO.contacts}
        </a>
      </div>
    </div>
    <div className={styles.stickers}>
      <p className={`${styles.sticker} ${styles.alt}`}>{HERO.stickers.opens}</p>
      <p className={`${styles.sticker} ${styles.warm}`}>{HERO.stickers.oat}</p>
      <a
        className={`${styles.sticker} ${styles.accent}`}
        href={LOYALTY_HREF}
      >
        {HERO.stickers.loyalty}
      </a>
      <Star
        className={styles.star}
        size={76}
      />
    </div>
  </section>
);
