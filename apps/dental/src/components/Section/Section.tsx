import type { ReactNode } from 'react';
import styles from './Section.module.scss';

type SectionProps = {
  /** Якорь раздела; заголовок получает `<id>-title`. */
  id: string;
  /** Подпись в левой колонке капителью: «02 — Услуги». */
  label: string;
  title?: string;
  children: ReactNode;
};

/** Раздел направления Swiss: подпись в трех колонках слева, содержимое — в девяти справа. */
export const Section = ({ id, label, title, children }: SectionProps) => (
  <section
    className={styles.section}
    id={id}
    aria-labelledby={title ? `${id}-title` : undefined}
    aria-label={title ? undefined : label}
  >
    <p className={styles.label}>{label}</p>
    <div className={styles.body}>
      {title && (
        <h2
          className={styles.title}
          id={`${id}-title`}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  </section>
);
