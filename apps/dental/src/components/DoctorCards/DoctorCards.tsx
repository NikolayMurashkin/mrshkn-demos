import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import { initialsOf, practiceSinceText } from '@/lib/format';
import type { Doctor } from '@/payload-types';
import { Arrow } from '../Arrow';
import styles from './DoctorCards.module.scss';

type DoctorCardsProps = {
  doctors: Doctor[];
};

/**
 * Врачи сеткой 3/3/3/3: на месте фото — плашка с инициалами (фото вымышленных врачей нет), имя, специальность
 * и строка со стрелкой. Вся ячейка — ссылка: имя растянуто на нее.
 */
export const DoctorCards = ({ doctors }: DoctorCardsProps) => (
  <ul className={styles.list}>
    {doctors.map((doctor) => (
      <li
        key={doctor.id}
        className={styles.card}
      >
        <span
          className={styles.initials}
          aria-hidden="true"
        >
          {initialsOf(doctor.name)}
        </span>
        <div className={styles.body}>
          <h3 className={styles.name}>
            <Link
              className={styles.link}
              href={`/doctors/${doctor.slug}`}
              prefetch={false}
            >
              {doctor.name}
            </Link>
          </h3>
          <p className={styles.position}>{typograph(doctor.position)}</p>
          <div className={styles.foot}>
            <p className={styles.since}>{practiceSinceText(doctor.practiceSince)}</p>
            <span className={styles.arrow}>
              <Arrow />
            </span>
          </div>
        </div>
      </li>
    ))}
  </ul>
);
