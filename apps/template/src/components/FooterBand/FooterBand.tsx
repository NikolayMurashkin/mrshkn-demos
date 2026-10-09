import { BAND } from '@/consts';
import { DEMO } from '@/demo.config';
import { Arrow } from '../Arrow';
import styles from './FooterBand.module.scss';

/**
 * Ультрамариновая плита над подвалом: вопрос, приглашение и почта дела. Отдельная секция перед подвалом ядра,
 * а не его часть: на странице один `<footer>`, и в нем подпись «Демо-проект студии MRSHKN».
 */
export const FooterBand = () => {
  const { email } = DEMO.business;

  return (
    <section
      className={styles.band}
      id="contact"
      aria-labelledby="contact-title"
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
          id="contact-title"
        >
          {BAND.title}
        </h2>
        <p className={styles.lead}>{BAND.lead}</p>
        {email && (
          <div className={styles.actions}>
            <a
              className={styles.cta}
              href={`mailto:${email}`}
            >
              {email}
              <Arrow />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
