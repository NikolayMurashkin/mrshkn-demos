import { Photo } from '@mrshkn/demo-core/components/Photo';
import { PHOTOS } from '@/assets/photos';
import { CLINIC_INSIDE, CLINIC_PHOTO_SIZES } from '@/consts';
import styles from './ClinicInside.module.scss';

/** «Клиника изнутри»: кадры клиники в колонках сетки, под каждым линия `ink` и подпись `kicker`. */
export const ClinicInside = () => (
  <ul className={styles.list}>
    {CLINIC_INSIDE.shots.map(({ photo, caption, alt }) => (
      <li key={photo}>
        <figure className={styles.shot}>
          <Photo
            className={styles.photo}
            src={PHOTOS[photo]}
            alt={alt}
            sizes={CLINIC_PHOTO_SIZES}
          />
          <figcaption className={styles.caption}>{caption}</figcaption>
        </figure>
      </li>
    ))}
  </ul>
);
