import { Photo } from '@mrshkn/demo-core/components/Photo';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { PHOTOS } from '../../assets/photos';
import { PHOTO_SIZES, RING_LENGTH, TAPE_REPEAT, TICKETS } from '../../consts';
import { concertDay, formatConcertDate } from '../../lib/concert-date';
import { formatTicketPrice } from '../../lib/price';
import { TEXTS } from '../../texts';
import { BuyLink } from '../BuyLink';
import styles from './Hero.module.scss';

type HeroProps = {
  lang: DemoLang;
  /** Начало концерта — посчитано при отрисовке страницы. */
  date: Date;
};

/**
 * Первый экран — сцена Kinetic: строки названия поднимаются, бейдж с датой крутится, две ленты едут навстречу.
 * Плашка «Мероприятие вымышленное» — первой, чтобы ее было видно без прокрутки на любом телефоне.
 */
export const Hero = ({ lang, date }: HeroProps) => {
  const texts = TEXTS[lang].hero;
  const day = formatConcertDate(date, lang);
  const price = formatTicketPrice(Math.min(...TICKETS.map((ticket) => ticket.price)), lang);
  const tape = Array.from({ length: TAPE_REPEAT }, () => [texts.kicker, day, TEXTS[lang].venue.name]).flat();

  return (
    <section
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.grid}>
        <div className={styles.notice}>
          <p className={styles.plate}>{texts.plate}</p>
          <p className={styles.plateNote}>{texts.plateNote}</p>
        </div>
        <p className={styles.kicker}>{texts.kicker}</p>
        <h1
          className={styles.title}
          id="hero-title"
          translate="no"
        >
          {texts.title.split(' ').map((word, index) => (
            <span
              key={word}
              className={styles.line}
            >
              {index > 0 && ' '}
              <span>{word}</span>
            </span>
          ))}
        </h1>
        <div className={styles.content}>
          <div className={styles.leadRow}>
            <div className={styles.subtitles}>
              <p className={styles.lead}>{texts.lead}</p>
              <div className={styles.facts}>
                <p className={styles.when}>
                  <time dateTime={date.toISOString()}>{day}</time> · {texts.time}
                </p>
                <p className={styles.where}>{texts.city}</p>
              </div>
            </div>
            <div className={styles.actions}>
              <BuyLink variant="primary">{texts.buy}</BuyLink>
              <p className={styles.price}>{texts.priceNote.replace('{price}', price)}</p>
            </div>
          </div>
        </div>
        <div className={styles.poster}>
          <Photo
            className={styles.photo}
            src={PHOTOS.poster}
            alt={texts.posterAlt}
            sizes={PHOTO_SIZES.poster}
            priority
          />
          <div
            className={styles.badge}
            aria-hidden="true"
          >
            <svg
              className={styles.spin}
              viewBox="0 0 260 260"
            >
              <defs>
                <path
                  id="hero-badge-ring"
                  d="M130,130 m-100,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0"
                />
              </defs>
              <text className={styles.ring}>
                <textPath
                  href="#hero-badge-ring"
                  textLength={RING_LENGTH}
                  lengthAdjust="spacing"
                >
                  {`${day} · ${texts.time} · `.toLocaleUpperCase(lang)}
                </textPath>
              </text>
            </svg>
            <span className={styles.disc}>{concertDay(date)}</span>
          </div>
        </div>
      </div>
      <div
        className={styles.tapes}
        aria-hidden="true"
      >
        <div className={`${styles.tape} ${styles.tapeInk}`}>
          <div className={styles.track}>
            {tape.map((item, index) => (
              <span
                key={index}
                className={styles.item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className={`${styles.tape} ${styles.tapeAccent}`}>
          <div className={styles.track}>
            {tape.map((item, index) => (
              <span
                key={index}
                className={styles.item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
