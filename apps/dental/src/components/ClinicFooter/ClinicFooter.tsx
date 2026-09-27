import { HOURS_TEXT, LICENSE, MEDICAL_WARNING } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText, phoneHref } from '@/lib/format';
import styles from './ClinicFooter.module.scss';

/** Реквизиты клиники над подписью демо: адрес, часы, лицензия и предупреждение о противопоказаниях. */
export const ClinicFooter = () => {
  const { name, address, telephone } = DEMO.business;

  return (
    <div className={styles.footer}>
      <p className={styles.line}>
        <strong className={styles.name}>{name}</strong>
        {telephone && (
          <a
            className={styles.phone}
            href={phoneHref(telephone)}
          >
            {telephone}
          </a>
        )}
        {address && <span>{addressText(address)}</span>}
        <span>{HOURS_TEXT}</span>
      </p>
      <p className={styles.line}>
        Лицензия на&nbsp;медицинскую деятельность №&nbsp;{LICENSE.number} от&nbsp;{LICENSE.dateShort}
      </p>
      <p className={styles.warning}>{MEDICAL_WARNING}</p>
    </div>
  );
};
