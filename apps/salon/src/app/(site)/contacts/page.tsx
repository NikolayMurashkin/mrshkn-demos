import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import { Photo } from '@mrshkn/demo-core/components/Photo';
import type { Metadata } from 'next';
import { BookingLink } from '@/components/BookingLink';
import { PageIntro } from '@/components/PageIntro';
import { SitePlate } from '@/components/SitePlate';
import { CONTACTS_PAGE, CONTACTS_PHOTO_FRAME, CONTACTS_PHOTO_SIZES, SALON } from '@/consts';
import { DEMO } from '@/demo.config';
import { coverSizes } from '@/lib/cover';
import { photoOf } from '@/lib/photo';
import shared from '../page.module.scss';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: CONTACTS_PAGE.title,
  description: CONTACTS_PAGE.description,
};

/**
 * Адрес, часы и дорога; карта Яндекса грузится только по нажатию, под ней — фото зала. «Написать в Telegram» — только
 * с ботом салона.
 */
const ContactsPage = () => {
  const photo = photoOf(CONTACTS_PAGE.photo);

  return (
    <>
      <main className={shared.page}>
        <PageIntro title={CONTACTS_PAGE.title} />
        <div className={styles.contacts}>
          <dl className={styles.list}>
            <div>
              <dt>{CONTACTS_PAGE.address}</dt>
              <dd>{SALON.address}</dd>
            </div>
            <div>
              <dt>{CONTACTS_PAGE.hours}</dt>
              <dd>{SALON.hours}</dd>
            </div>
            <div>
              <dt>{CONTACTS_PAGE.how}</dt>
              <dd>{CONTACTS_PAGE.howText}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            <BookingLink />
            {DEMO.miniAppUrl && (
              <a
                className={styles.write}
                href={DEMO.miniAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACTS_PAGE.write}
              </a>
            )}
          </div>
          {DEMO.business.geo && (
            <div className={styles.map}>
              <MapEmbed
                point={DEMO.business.geo}
                label={CONTACTS_PAGE.mapLabel}
              />
            </div>
          )}
          {photo && (
            <Photo
              src={photo}
              alt={CONTACTS_PAGE.photoAlt}
              sizes={coverSizes(CONTACTS_PHOTO_SIZES, photo, CONTACTS_PHOTO_FRAME)}
              className={styles.photo}
            />
          )}
        </div>
      </main>
      <SitePlate />
    </>
  );
};

export default ContactsPage;
