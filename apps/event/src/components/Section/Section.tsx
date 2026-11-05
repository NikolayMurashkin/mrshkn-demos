import type { ReactNode } from 'react';
import styles from './Section.module.scss';

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

/** Секция главной Kinetic: заголовок прописными, под ним содержимое. */
export const Section = ({ id, title, children }: SectionProps) => (
  <section
    className={styles.section}
    id={id}
    aria-labelledby={`${id}-title`}
  >
    <h2
      className={styles.title}
      id={`${id}-title`}
    >
      {title}
    </h2>
    {children}
  </section>
);
