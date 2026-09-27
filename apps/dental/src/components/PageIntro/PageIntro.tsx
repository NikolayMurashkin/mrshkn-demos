import type { ReactNode } from 'react';
import styles from './PageIntro.module.scss';

type PageIntroProps = {
  label: string;
  /** Вторая строка подписи акцентным цветом: специальность врача, адрес. */
  note?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
};

/** Первый экран внутренней страницы: подпись слева, заголовок, вводный абзац и кнопки справа. */
export const PageIntro = ({ label, note, title, lead, children }: PageIntroProps) => (
  <section
    className={styles.intro}
    aria-labelledby="page-title"
  >
    <p className={styles.label}>
      <span>{label}</span>
      {note && <span className={styles.note}>{note}</span>}
    </p>
    <div className={styles.body}>
      <h1
        className={styles.title}
        id="page-title"
      >
        {title}
      </h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  </section>
);
