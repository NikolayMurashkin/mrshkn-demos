import type { ReactNode } from 'react';
import { STUDIO_NAME, STUDIO_URL } from '../../consts';
import styles from './DemoFooter.module.scss';

type DemoFooterProps = {
  policyHref: string;
  children?: ReactNode;
};

/** Подпись «Демо-проект студии» — обязательная часть каждого демо, поэтому она не настраивается. */
export const DemoFooter = ({ policyHref, children }: DemoFooterProps) => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      {children}
      <div className={styles.meta}>
        <p className={styles.mark}>
          Демо-проект <a href={STUDIO_URL}>студии {STUDIO_NAME}</a>
        </p>
        <a href={policyHref}>Политика обработки данных</a>
      </div>
    </div>
  </footer>
);
