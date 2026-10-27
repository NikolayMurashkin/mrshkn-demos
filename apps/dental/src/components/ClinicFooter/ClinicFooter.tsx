import { NBSP } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import { FOOTER_LINKS, FOOTER_NAV_LABEL, HOURS_TEXT, LICENSE, MEDICAL_WARNING } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText, phoneHref } from '@/lib/format';
import { NumberText } from '../NumberText';
import { PhoneText } from '../PhoneText';
import styles from './ClinicFooter.module.scss';

/**
 * Нижняя строка подвала над подписью демо: знак клиники, контакты, лицензия, ссылки на сведения о клинике, поиск
 * и анкету (на всех страницах) и предупреждение о противопоказаниях. Номер лицензии автопереводчик браузера
 * не трогает, слова вокруг переводятся.
 */
export const ClinicFooter = () => {
  const { name, address, telephone } = DEMO.business;

  return (
    <div className={styles.footer}>
      <p className={styles.name}>{name}</p>
      <p className={styles.line}>
        {telephone && (
          <a
            className={styles.phone}
            href={phoneHref(telephone)}
          >
            <PhoneText phone={telephone} />
          </a>
        )}
        {address && <span>{addressText(address)}</span>}
        <span>
          <NumberText text={HOURS_TEXT} />
        </span>
      </p>
      <p className={styles.license}>
        <NumberText text={`Лицензия на${NBSP}медицинскую деятельность`} />{' '}
        <span translate="no">
          <NumberText text={`№${NBSP}${LICENSE.number}`} />
        </span>{' '}
        <NumberText text={`от${NBSP}${LICENSE.dateShort}`} />
      </p>
      <nav
        className={styles.links}
        aria-label={FOOTER_NAV_LABEL}
      >
        {FOOTER_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            className={styles.link}
            href={href}
            prefetch={false}
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className={styles.warning}>{MEDICAL_WARNING}</p>
    </div>
  );
};
