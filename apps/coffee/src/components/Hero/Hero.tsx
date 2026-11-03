import { Photo } from '@mrshkn/demo-core/components/Photo';
import { PHOTOS } from '../../assets/photos';
import { HERO, HERO_PHOTO, HERO_PHOTO_SIZES, LOYALTY_HREF, MENU_HREF } from '../../consts';
import { Arrow } from '../Arrow';
import { Star } from '../Star';
import styles from './Hero.module.scss';

/**
 * Первый экран — стикерборд: заголовок и кнопки, рядом кадр зала и поверх него три стикера-обещания; последний ведет
 * в лояльность. Кадр — первый экран, грузится сразу.
 */
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
      <Photo
        className={styles.photo}
        src={PHOTOS[HERO_PHOTO.photo]}
        alt={HERO_PHOTO.alt}
        sizes={HERO_PHOTO_SIZES}
        priority
      />
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
