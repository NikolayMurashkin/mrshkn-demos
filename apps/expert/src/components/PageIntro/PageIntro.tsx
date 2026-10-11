import type { ReactNode } from 'react';
import styles from './PageIntro.module.scss';

type PageIntroProps = {
  title: string;
  lead?: string;
  /** Буквица у лида: страница «Обо мне». */
  dropcap?: boolean;
  /** Поля разворота: портрет, мета статьи, адрес. */
  aside?: ReactNode;
  /** Кнопки под лидом. */
  children?: ReactNode;
};

/** Головка страницы `.e-intro`: на полях (1–3) — портрет или мета, в основной колонке (4–11) — H1, лид и кнопки. */
export const PageIntro = ({ title, lead, dropcap = false, aside, children }: PageIntroProps) => (
  <header className={styles.intro}>
    <div className={styles.aside}>{aside}</div>
    <div className={styles.main}>
      <h1
        className={styles.title}
        id="page-title"
      >
        {title}
      </h1>
      {lead && <p className={dropcap ? `${styles.lead} ${styles.dropcap}` : styles.lead}>{lead}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  </header>
);
