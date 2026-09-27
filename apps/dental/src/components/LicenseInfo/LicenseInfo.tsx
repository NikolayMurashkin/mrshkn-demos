import { LICENSE } from '@/consts';
import styles from './LicenseInfo.module.scss';

export const LicenseInfo = () => (
  <dl className={styles.list}>
    <div className={styles.cell}>
      <dt className={styles.term}>Лицензия на&nbsp;медицинскую деятельность</dt>
      <dd className={styles.value}>
        №&nbsp;{LICENSE.number} от&nbsp;{LICENSE.date}
      </dd>
    </div>
    <div className={styles.cell}>
      <dt className={styles.term}>Выдана</dt>
      <dd className={styles.value}>{LICENSE.issuer}</dd>
    </div>
    <div className={`${styles.cell} ${styles.wide}`}>
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
