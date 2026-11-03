import { Photo } from '@mrshkn/demo-core/components/Photo';
import { typograph } from '@mrshkn/demo-core/typograph';
import Link from 'next/link';
import { DOCTOR_CARD_PHOTO_SIZES } from '@/consts';
import { initialsOf, practiceSinceText } from '@/lib/format';
import { photoOf } from '@/lib/photo';
import type { Doctor } from '@/payload-types';
import { Arrow } from '../Arrow';
import styles from './DoctorCards.module.scss';

type DoctorCardsProps = {
  doctors: Doctor[];
};

/**
 * Врачи сеткой 3/3/3/3: портрет 4:5 (врач без кадра — плашка с инициалами), имя, специальность и строка со стрелкой.
 * Вся ячейка — ссылка: имя растянуто на нее. У портрета пустой `alt`: имя стоит рядом текстом, диктор не читает его
 * дважды, а в режиме «без картинок» на месте кадра ничего нет.
 */
export const DoctorCards = ({ doctors }: DoctorCardsProps) => (
  <ul className={styles.list}>
    {doctors.map((doctor) => {
      const photo = photoOf(doctor.photo);

      return (
        <li
          key={doctor.id}
          className={styles.card}
        >
          {photo ? (
            <Photo
              className={styles.photo}
              src={photo}
              alt=""
              sizes={DOCTOR_CARD_PHOTO_SIZES}
            />
          ) : (
            <span
              className={styles.initials}
              aria-hidden="true"
            >
              {initialsOf(doctor.name)}
            </span>
          )}
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
      );
    })}
  </ul>
);
