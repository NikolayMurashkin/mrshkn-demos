import type { DemoLang } from '@mrshkn/demo-core/types';
import { LANG_CODES, LANGS } from '../../consts';
import { langHref } from '../../lib/lang';
import { TEXTS } from '../../texts';
import { BuyLink } from '../BuyLink';
import styles from './Header.module.scss';

type HeaderProps = {
  lang: DemoLang;
  /** Путь страницы без языка: переключатель ведет на ту же страницу на другом языке. */
  path?: string;
};

/** Шапка: название концерта ссылкой на главную, переключатель языка, «Купить билет». */
export const Header = ({ lang, path = '' }: HeaderProps) => {
  const texts = TEXTS[lang];

  return (
    <header className={styles.header}>
      <a
        className={styles.brand}
        href={langHref(lang)}
        translate="no"
      >
        {texts.header.home}
      </a>
      <div className={styles.controls}>
        <nav
          className={styles.locales}
          aria-label={texts.header.langLabel}
        >
          {LANGS.map((item) => (
            <a
              key={item}
              className={styles.locale}
              href={langHref(item, path)}
              hrefLang={item}
              lang={item}
              aria-current={item === lang ? 'true' : undefined}
            >
              {LANG_CODES[item]}
            </a>
          ))}
        </nav>
        <BuyLink
          className={styles.cta}
          size="sm"
        >
          {texts.hero.buy}
        </BuyLink>
      </div>
    </header>
  );
};
