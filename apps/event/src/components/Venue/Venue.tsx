import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import { Photo } from '@mrshkn/demo-core/components/Photo';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { PHOTOS } from '../../assets/photos';
import { PHOTO_SIZES } from '../../consts';
import { DEMOS } from '../../demo.config';
import { TEXTS } from '../../texts';
import { Section } from '../Section';
import styles from './Venue.module.scss';

type VenueProps = {
  lang: DemoLang;
};

/** Клуб, адрес и как добраться; карта Яндекса — только по нажатию «Показать карту», как у «Кофейни». */
export const Venue = ({ lang }: VenueProps) => {
  const texts = TEXTS[lang].venue;
  const { geo } = DEMOS[lang].business;

  return (
    <Section
      id="venue"
      title={texts.title}
    >
      <div className={styles.grid}>
        <div className={styles.text}>
          <h3 className={styles.name}>{texts.name}</h3>
          <div className={styles.place}>
            <p className={styles.address}>{texts.address}</p>
            <p className={styles.addressNote}>{texts.addressNote}</p>
          </div>
          <p>{texts.text}</p>
          <h3 className={styles.subtitle}>{texts.howTo}</h3>
          <p>{texts.howToText}</p>
        </div>
        <Photo
          className={styles.photo}
          src={PHOTOS.venue}
          alt={texts.photoAlt}
          sizes={PHOTO_SIZES.half}
        />
      </div>
      {geo && (
        <MapEmbed
          point={geo}
          label={`${texts.name}, ${texts.address}`}
          lang={lang}
        />
      )}
    </Section>
  );
};
