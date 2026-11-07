import type { ReactNode } from 'react';
import { ArrowIcon } from '@/components/Icons';
import styles from './Section.module.scss';

type SectionProps = {
  id: string;
  title: string;
  note?: string;
  /** Ссылка под содержимым: «Все мастера» →. */
  more?: { href: string; label: string };
  children: ReactNode;
};

/** Секция главной: головка — заголовок Dela и примечание справа, под содержимым — ссылка со стрелкой. */
export const Section = ({ id, title, note, more, children }: SectionProps) => (
  <section
    className={styles.section}
    aria-labelledby={`${id}-title`}
  >
    <div className={styles.head}>
      <h2
        className={styles.title}
        id={`${id}-title`}
      >
        {title}
      </h2>
      {note && <p className={styles.note}>{note}</p>}
    </div>
    {children}
    {more && (
      <a
        className={styles.more}
        href={more.href}
      >
        {more.label}
        <ArrowIcon />
      </a>
    )}
  </section>
);
