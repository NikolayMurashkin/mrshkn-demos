import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import { DIRECTIONS_TEXT, HOURS_TEXT } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText, phoneHref } from '@/lib/format';
import styles from './Contacts.module.scss';

export const Contacts = () => {
  const { address, geo, name, telephone } = DEMO.business;

  return (
    <div className={styles.contacts}>
      <dl className={styles.facts}>
        {telephone && (
          <div className={styles.cell}>
            <dt className={styles.term}>Телефон</dt>
            <dd className={styles.value}>
              <a
                className={styles.phone}
                href={phoneHref(telephone)}
              >
                {telephone}
              </a>
            </dd>
          </div>
        )}
        {address && (
          <div className={styles.cell}>
            <dt className={styles.term}>Адрес</dt>
            <dd className={styles.value}>{addressText(address)}</dd>
          </div>
        )}
        <div className={styles.cell}>
          <dt className={styles.term}>Часы работы</dt>
          <dd className={styles.value}>{HOURS_TEXT}</dd>
        </div>
        <div className={styles.cell}>
          <dt className={styles.term}>Как добраться</dt>
          <dd className={styles.note}>{DIRECTIONS_TEXT}</dd>
        </div>
      </dl>
      {geo && (
        <MapEmbed
          point={geo}
          label={`${name} на карте`}
        />
      )}
    </div>
  );
};
