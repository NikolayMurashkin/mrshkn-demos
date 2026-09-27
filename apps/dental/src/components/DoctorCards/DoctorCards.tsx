import Link from 'next/link';
import { initialsOf, practiceSinceText } from '@/lib/format';
import type { Doctor } from '@/payload-types';
import styles from './DoctorCards.module.scss';

type DoctorCardsProps = {
  doctors: Doctor[];
};

/** Карточки врачей: на месте фото — инициалы, фото вымышленных врачей нет. */
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
        <p className={styles.position}>{doctor.position}</p>
        <h3 className={styles.name}>
          <Link
            href={`/doctors/${doctor.slug}`}
            prefetch={false}
          >
            {doctor.name}
          </Link>
        </h3>
        <p className={styles.since}>{practiceSinceText(doctor.practiceSince)}</p>
      </li>
    ))}
  </ul>
);
