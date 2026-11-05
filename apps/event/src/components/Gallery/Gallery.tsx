import { Photo } from '@mrshkn/demo-core/components/Photo';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { PHOTOS } from '../../assets/photos';
import { GALLERY, PHOTO_SIZES } from '../../consts';
import { TEXTS } from '../../texts';
import { Section } from '../Section';
import styles from './Gallery.module.scss';

type GalleryProps = {
  lang: DemoLang;
};

export const Gallery = ({ lang }: GalleryProps) => {
  const texts = TEXTS[lang].gallery;

  return (
    <Section
      id="gallery"
      title={texts.title}
    >
      <ul className={styles.grid}>
        {GALLERY.map((key, index) => (
          <li
            key={key}
            className={styles.item}
          >
            <Photo
              className={styles.photo}
              src={PHOTOS[key]}
              alt={texts.alts[index]}
              sizes={PHOTO_SIZES.gallery}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
};
