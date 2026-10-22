import { DEMO } from '../../demo.config';
import { addressText, phoneHref } from '../../lib/format';
import { Wordmark } from '../Wordmark';
import styles from './SiteFooter.module.scss';

/** Строка кофейни над подписью демо в общем подвале: знак, адрес, телефон. */
export const SiteFooter = () => {
  const { address, telephone } = DEMO.business;

  return (
    <div className={styles.bar}>
      <Wordmark className={styles.wordmark} />
      <div className={styles.info}>
        {address && <span>{addressText(address)}</span>}
        {telephone && (
          <a
            className={styles.phone}
            href={phoneHref(telephone)}
          >
            {telephone}
          </a>
        )}
      </div>
    </div>
  );
};
