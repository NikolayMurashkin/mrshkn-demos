import { HOURS_TEXT, INFO, ORGANIZATION } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText, phoneHref } from '@/lib/format';
import { NumberText } from '../NumberText';
import { PhoneText } from '../PhoneText';
import styles from './OrganizationInfo.module.scss';

/** Реквизиты клиники списком определений: вид — как у лицензии, подпись слева, значение справа. */
export const OrganizationInfo = () => {
  const { address, telephone } = DEMO.business;

  return (
    <dl className={styles.list}>
      <div className={styles.row}>
        <dt className={styles.term}>{INFO.fullNameLabel}</dt>
        <dd className={styles.value}>{ORGANIZATION.fullName}</dd>
      </div>
      <div className={styles.row}>
        <dt className={styles.term}>{INFO.ogrnLabel}</dt>
        <dd className={`${styles.value} ${styles.number}`}>{ORGANIZATION.ogrn}</dd>
      </div>
      {address && (
        <div className={styles.row}>
          <dt className={styles.term}>{INFO.addressLabel}</dt>
          <dd className={styles.value}>{addressText(address)}</dd>
        </div>
      )}
      {telephone && (
        <div className={styles.row}>
          <dt className={styles.term}>{INFO.phoneLabel}</dt>
          <dd className={styles.value}>
            <a
              className={styles.phone}
              href={phoneHref(telephone)}
            >
              <PhoneText phone={telephone} />
            </a>
          </dd>
        </div>
      )}
      <div className={styles.row}>
        <dt className={styles.term}>{INFO.hoursLabel}</dt>
        <dd className={styles.value}>
          <NumberText text={HOURS_TEXT} />
        </dd>
      </div>
    </dl>
  );
};
