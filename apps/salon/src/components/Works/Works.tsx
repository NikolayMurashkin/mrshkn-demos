import { Photo } from '@mrshkn/demo-core/components/Photo';
import { WORK_PHOTO_FRAME, WORK_PHOTO_SIZES } from '@/consts';
import { coverSizes } from '@/lib/cover';
import { PHOTOS } from '@/assets/photos';
import type { MasterWork } from '@/types';
import styles from './Works.module.scss';

type WorksProps = {
  works: MasterWork[];
};

/** Снимки работ мастера: квадратные кадры в ряд, подпись — в `alt`; `sizes` — ширина отрисовки кадра в квадрате. */
export const Works = ({ works }: WorksProps) => (
  <ul className={styles.works}>
    {works.map(({ photo, alt, focus }) => (
      <li key={photo}>
        <Photo
          src={PHOTOS[photo]}
          alt={alt}
          sizes={coverSizes(WORK_PHOTO_SIZES, PHOTOS[photo], WORK_PHOTO_FRAME)}
          className={focus === 'top' ? `${styles.photo} ${styles.top}` : styles.photo}
        />
      </li>
    ))}
  </ul>
);
