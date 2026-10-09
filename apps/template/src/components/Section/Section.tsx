import type { ReactNode } from 'react';
import styles from './Section.module.scss';

type SectionProps = {
  /** Якорь раздела; заголовок получает `<id>-title`. */
  id: string;
  /** Метка раздела одним словом; номер перед ней ставит счетчик разделов. */
  label: string;
  /** Без заголовка содержимое встает справа от метки: свой заголовок у него внутри. */
  title?: string;
  /** Содержимое на все 12 колонок, а не на 9 справа. */
  wide?: boolean;
  children: ReactNode;
};

/** Раздел DS Swiss: линия 2px сверху, слева номер и метка (3 колонки), справа заголовок и содержимое (9). */
export const Section = ({ id, label, title, wide = false, children }: SectionProps) => (
  <section
    className={styles.section}
    id={id}
    aria-labelledby={title ? `${id}-title` : undefined}
    aria-label={title ? undefined : label}
  >
    <div className={styles.grid}>
      <div className={styles.aside}>
        <span
          className={styles.index}
          aria-hidden="true"
        />
        <p className={styles.mark}>{label}</p>
      </div>
      {title && (
        <h2
          className={styles.title}
          id={`${id}-title`}
        >
          {title}
        </h2>
      )}
      <div className={wide ? `${styles.body} ${styles.wide}` : styles.body}>{children}</div>
    </div>
  </section>
);
