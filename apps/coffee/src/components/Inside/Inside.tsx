import { Photo } from '@mrshkn/demo-core/components/Photo';
import { PHOTOS } from '../../assets/photos';
import { INSIDE, INSIDE_PHOTO_SIZES } from '../../consts';
import styles from './Inside.module.scss';

/** «Как у нас» на главной: три кадра кофейни стикерами-снимками, у каждого подпись. */
export const Inside = () => (
  <section
    className={styles.section}
    aria-labelledby="inside-title"
  >
    <h2
      className={styles.title}
      id="inside-title"
    >
      {INSIDE.title}
    </h2>
    <ul className={styles.shots}>
      {INSIDE.shots.map(({ photo, caption, alt }) => (
        <li
          key={photo}
          className={styles.item}
        >
          <figure className={styles.shot}>
            <Photo
              className={styles.photo}
              src={PHOTOS[photo]}
              alt={alt}
              sizes={INSIDE_PHOTO_SIZES}
            />
            <figcaption className={styles.caption}>{caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  </section>
);
