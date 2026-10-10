import type { ReactNode } from 'react';
import { STUDIO_URL } from '../../consts';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang } from '../../types';
import styles from './DemoFooter.module.scss';

type DemoFooterProps = {
  policyHref: string;
  lang?: DemoLang;
  children?: ReactNode;
};

/** Подпись «Демо-проект студии» — обязательная часть каждого демо, поэтому она не настраивается. */
export const DemoFooter = ({ policyHref, lang = 'ru', children }: DemoFooterProps) => {
  const texts = CORE_TEXTS[lang].footer;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {children}
        <div className={styles.meta}>
          <p className={styles.mark}>
            {texts.mark} <a href={STUDIO_URL}>{texts.studio}</a>
          </p>
          <a href={policyHref}>{texts.policy}</a>
        </div>
      </div>
    </footer>
  );
};
