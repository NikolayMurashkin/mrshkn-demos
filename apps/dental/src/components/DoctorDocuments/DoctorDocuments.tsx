import { typograph } from '@mrshkn/demo-core/typograph';
import { DOCTOR_DOCUMENTS } from '@/consts';
import { formatDay } from '@/lib/format';
import type { Doctor } from '@/payload-types';
import { NumberText } from '../NumberText';
import styles from './DoctorDocuments.module.scss';

type DoctorDocumentsProps = {
  accreditation: Doctor['accreditation'];
  schedule: Doctor['schedule'];
};

/** Документ, который дает врачу право лечить, со сроком действия, и график приема — строками «дни — часы». */
export const DoctorDocuments = ({ accreditation, schedule }: DoctorDocumentsProps) => (
  <div className={styles.documents}>
    <div className={styles.document}>
      <p className={styles.line}>
        <span className={styles.kind}>{DOCTOR_DOCUMENTS.kinds[accreditation.kind]}:</span>{' '}
        {typograph(accreditation.specialty)}, {DOCTOR_DOCUMENTS.validUntil}
        {formatDay(accreditation.validUntil)}
      </p>
      <p className={styles.note}>{DOCTOR_DOCUMENTS.notes[accreditation.kind]}</p>
    </div>
    {schedule.length > 0 && (
      <div className={styles.schedule}>
        <h3 className={styles.subtitle}>{DOCTOR_DOCUMENTS.schedule}</h3>
        <ul className={styles.rows}>
          {schedule.map(({ id, days, hours }) => (
            <li
              key={id ?? `${days}${hours}`}
              className={styles.row}
            >
              <span className={styles.days}>{typograph(days)}</span>
              <span aria-hidden="true">{' — '}</span>
              <span className={styles.hours}>
                <NumberText text={hours} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
