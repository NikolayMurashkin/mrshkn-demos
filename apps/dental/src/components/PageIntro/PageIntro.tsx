import { Photo } from '@mrshkn/demo-core/components/Photo';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { DOCTOR_PAGE_PHOTO_SIZES } from '@/consts';
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
  /**
   * Портрет 4:5 под меткой (≤ 1080 — после заголовка, лида и кнопок). Без `alt`: рядом заголовок с именем, диктор
   * не читает его дважды.
   */
  portrait?: StaticImageData;
  children?: ReactNode;
};

/** Головка внутренней страницы Swiss: линия 2px, слева номер, метка и портрет врача, справа H1, лид и кнопки. */
export const PageIntro = ({ label, note, title, lead, back, portrait, children }: PageIntroProps) => (
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
    <div className={portrait ? `${styles.head} ${styles.withPortrait}` : styles.head}>
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
      {portrait && (
        <Photo
          className={styles.portrait}
          src={portrait}
          alt=""
          sizes={DOCTOR_PAGE_PHOTO_SIZES}
          priority
        />
      )}
    </div>
  </section>
);
