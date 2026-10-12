import Link from 'next/link';
import { Command } from '@/components/Command';
import { FOOTER_CTA, HEADER_CTA } from '@/consts';
import styles from './CallToAction.module.scss';

/** Плита над подвалом демо — Footer DS: команда, крупный призыв, главная кнопка в быстрый старт. */
export const CallToAction = () => (
  <section
    className={styles.band}
    aria-labelledby="cta-title"
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
        id="cta-title"
      >
        {FOOTER_CTA.title}
      </h2>
    </div>
    <div className={styles.aside}>
      <Link
        className={styles.button}
        href={HEADER_CTA.href}
        prefetch={false}
      >
        {FOOTER_CTA.cta} <span aria-hidden="true">→</span>
      </Link>
      <p className={styles.note}>
        <span aria-hidden="true">{'// '}</span>
        {FOOTER_CTA.note}
      </p>
    </div>
  </section>
);
