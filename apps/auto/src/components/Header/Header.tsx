import type { DemoLang } from '@mrshkn/demo-core/types';
import { LANG_CODES, LANGS } from '../../consts';
import { langHref } from '../../lib/lang';
import { TEXTS } from '../../texts';
import styles from './Header.module.scss';

type HeaderProps = {
  lang: DemoLang;
  /** Страница без языка: переключатель ведет на нее же на другом языке. */
  path?: string;
};

export const Header = ({ lang, path = '' }: HeaderProps) => {
  const texts = TEXTS[lang].header;

  return (
    <header className={styles.top}>
      <a
        className={styles.brand}
        href={langHref(lang)}
      >
        <span
          className={styles.mark}
          translate="no"
        >
          {texts.brand}
        </span>
        <span className={styles.note}>{texts.brandNote}</span>
      </a>
      <nav aria-label={texts.langLabel}>
        <ul className={styles.lang}>
          {LANGS.map((item) => (
            <li key={item}>
              <a
                className={styles.langLink}
                href={langHref(item, path)}
                hrefLang={item}
                lang={item}
                aria-current={item === lang ? 'page' : undefined}
              >
                {LANG_CODES[item]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
