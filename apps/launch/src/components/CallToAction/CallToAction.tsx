import { Command } from '@/components/Command';
import { WaitlistForm } from '@/components/WaitlistForm';
import { FOOTER_CTA } from '@/consts';
import styles from './CallToAction.module.scss';

/** Плита над подвалом демо — Footer DS: команда, крупный призыв и форма списка ожидания; на нее ведут тарифы. */
export const CallToAction = () => (
  <section
    className={styles.band}
    id={FOOTER_CTA.id}
    aria-labelledby={`${FOOTER_CTA.id}-title`}
  >
    <div className={styles.lead}>
      <p
        className={styles.prompt}
        translate="no"
      >
        <span className={styles.sign}>$</span> <Command command={FOOTER_CTA.prompt} />
      </p>
      <h2
        className={styles.title}
        id={`${FOOTER_CTA.id}-title`}
      >
        {FOOTER_CTA.title}
      </h2>
    </div>
    <div className={styles.aside}>
      <WaitlistForm />
      <p className={styles.note}>
        <span aria-hidden="true">{'// '}</span>
        {FOOTER_CTA.note}
      </p>
    </div>
  </section>
);
