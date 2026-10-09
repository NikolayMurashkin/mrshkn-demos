import { BAND, HOURS_TEXT } from '@/consts';
import { DEMO } from '@/demo.config';
import { phoneHref } from '@/lib/format';
import { Arrow } from '../Arrow';
import styles from './FooterBand.module.scss';

/** Ультрамариновая плита над подвалом: вопрос, приглашение и звонок в клинику с часами работы. */
export const FooterBand = () => {
  const { telephone } = DEMO.business;

  return (
    <section
      className={styles.band}
      aria-labelledby="band-title"
    >
      <div className={styles.aside}>
        <span
          className={styles.index}
          aria-hidden="true"
        />
        <p className={styles.mark}>{BAND.label}</p>
      </div>
      <div className={styles.main}>
        <h2
          className={styles.title}
          id="band-title"
        >
          {BAND.title}
        </h2>
        <p className={styles.lead}>{BAND.lead}</p>
        {telephone && (
          <div className={styles.actions}>
            <a
              className={styles.cta}
              href={phoneHref(telephone)}
            >
              {telephone}
              <Arrow />
            </a>
            <p className={styles.note}>{HOURS_TEXT}</p>
          </div>
        )}
      </div>
    </section>
  );
};
