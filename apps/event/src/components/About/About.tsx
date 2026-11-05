import { Photo } from '@mrshkn/demo-core/components/Photo';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { PHOTOS } from '../../assets/photos';
import { PHOTO_SIZES } from '../../consts';
import { TEXTS } from '../../texts';
import { Section } from '../Section';
import styles from './About.module.scss';

type AboutProps = {
  lang: DemoLang;
};

export const About = ({ lang }: AboutProps) => {
  const texts = TEXTS[lang].about;

  return (
    <Section
      id="about"
      title={texts.title}
    >
      <div className={styles.grid}>
        <Photo
          className={styles.photo}
          src={PHOTOS.quartet}
          alt={texts.photoAlt}
          sizes={PHOTO_SIZES.half}
        />
        <div className={styles.text}>
          {texts.text.map((paragraph, index) => (
            <p
              key={paragraph}
              className={index === 0 ? styles.first : undefined}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
};
