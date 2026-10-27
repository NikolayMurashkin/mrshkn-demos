import { NBSP } from '@mrshkn/demo-core/consts';
import { LICENSE } from '@/consts';
import { NumberText } from '../NumberText';
import styles from './LicenseInfo.module.scss';

/**
 * Лицензия списком определений; вид — строки PlanRow DS без цены: подпись слева, значение справа. Номер
 * автопереводчик браузера не трогает, «от» и дата переводятся.
 */
export const LicenseInfo = () => (
  <dl className={styles.list}>
    <div className={styles.row}>
      <dt className={styles.term}>Лицензия на&nbsp;медицинскую деятельность</dt>
      <dd className={`${styles.value} ${styles.number}`}>
        <span translate="no">
          <NumberText text={`№${NBSP}${LICENSE.number}`} />
        </span>{' '}
        <NumberText text={`от${NBSP}${LICENSE.date}`} />
      </dd>
    </div>
    <div className={styles.row}>
      <dt className={styles.term}>Выдана</dt>
      <dd className={styles.value}>{LICENSE.issuer}</dd>
    </div>
    <div className={styles.row}>
      <dt className={styles.term}>Виды работ по&nbsp;лицензии</dt>
      <dd className={styles.value}>
        <ul className={styles.activities}>
          {LICENSE.activities.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </dd>
    </div>
  </dl>
);
