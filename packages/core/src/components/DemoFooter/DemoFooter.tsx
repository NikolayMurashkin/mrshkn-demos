import type { ReactNode } from 'react';
import { STUDIO_NAME, STUDIO_URL } from '../../consts';
import { CORE_TEXTS } from '../../texts';
import type { DemoFooterLayout, DemoLang } from '../../types';
import styles from './DemoFooter.module.scss';

type DemoFooterProps = {
  policyHref: string;
  lang?: DemoLang;
  /** `colophon` — ссылку на политику (`policyHref`) демо ставит в свой колофон в `children`. */
  layout?: DemoFooterLayout;
  children?: ReactNode;
};

/** Подпись «Демо-проект студии» — обязательная часть каждого демо, поэтому она не настраивается. */
export const DemoFooter = ({ policyHref, lang = 'ru', layout = 'default', children }: DemoFooterProps) => {
  const texts = CORE_TEXTS[lang].footer;
  const [beforeName, afterName] = texts.studio.split(STUDIO_NAME);

  return (
    <footer className={layout === 'colophon' ? `${styles.footer} ${styles.colophon}` : styles.footer}>
      <div className={styles.inner}>
        {children}
        <div className={styles.meta}>
          <p className={styles.mark}>
            {texts.mark}{' '}
            <a href={STUDIO_URL}>
              {beforeName}
              <span translate="no">{STUDIO_NAME}</span>
              {afterName}
            </a>
          </p>
          {layout === 'default' && <a href={policyHref}>{texts.policy}</a>}
        </div>
      </div>
    </footer>
  );
};
