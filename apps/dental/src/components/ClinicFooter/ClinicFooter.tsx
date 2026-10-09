import { HOURS_TEXT, LICENSE, MEDICAL_WARNING } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText, phoneHref } from '@/lib/format';
import styles from './ClinicFooter.module.scss';

/** Нижняя строка подвала над подписью демо: знак клиники, контакты, лицензия и предупреждение о противопоказаниях. */
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
            {telephone}
          </a>
        )}
        {address && <span>{addressText(address)}</span>}
        <span>{HOURS_TEXT}</span>
      </p>
      <p className={styles.license}>
        Лицензия на&nbsp;медицинскую деятельность №&nbsp;{LICENSE.number} от&nbsp;{LICENSE.dateShort}
      </p>
      <p className={styles.warning}>{MEDICAL_WARNING}</p>
    </div>
  );
};
