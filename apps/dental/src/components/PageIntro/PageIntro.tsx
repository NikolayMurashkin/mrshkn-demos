import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PageIntroBack } from './types';
import styles from './PageIntro.module.scss';

type PageIntroProps = {
  /** Метка страницы одним словом; номер перед ней ставит счетчик разделов. */
  label: string;
  /** Вторая строка подписи акцентным цветом: специальность врача, цена услуги. */
  note?: string;
  title: string;
  lead?: string;
  /** Ссылка «назад» над головкой: со страницы врача или услуги — обратно в ее раздел. */
  back?: PageIntroBack;
  children?: ReactNode;
};

/** Головка внутренней страницы Swiss: линия 2px, слева номер и метка, справа H1, лид и кнопки. */
export const PageIntro = ({ label, note, title, lead, back, children }: PageIntroProps) => (
  <section
    className={styles.intro}
    aria-labelledby="page-title"
  >
    {back && (
      <Link
        className={styles.back}
        href={back.href}
        prefetch={false}
      >
        <span aria-hidden="true">←</span>
        {back.label}
      </Link>
    )}
    <div className={styles.head}>
      <div className={styles.aside}>
        <span
          className={styles.index}
          aria-hidden="true"
        />
        <p className={styles.mark}>{label}</p>
        {note && <p className={styles.note}>{note}</p>}
      </div>
      <div className={styles.main}>
        <h1
          className={styles.title}
          id="page-title"
        >
          {title}
        </h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </div>
  </section>
);
