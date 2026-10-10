import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import type { DemoConfig, DemoLang } from '@mrshkn/demo-core/types';
import { addressText, phoneHref } from '../../lib/lang';
import { TEXTS } from '../../texts';
import styles from './Contacts.module.scss';

type ContactsProps = {
  demo: DemoConfig;
  lang: DemoLang;
};

/** Адрес, телефон и часы вымышленного сервиса; карта Яндекса — только по нажатию. */
export const Contacts = ({ demo, lang }: ContactsProps) => {
  const texts = TEXTS[lang].contacts;
  const { address, telephone, geo, name } = demo.business;

  return (
    <div className={styles.contacts}>
      <dl className={styles.list}>
        {address && (
          <div className={styles.row}>
            <dt>{texts.address}</dt>
            <dd>{addressText(address, lang)}</dd>
          </div>
        )}
        {telephone && (
          <div className={styles.row}>
            <dt>{texts.phone}</dt>
            <dd>
              <a href={phoneHref(telephone)}>{telephone}</a>
            </dd>
          </div>
        )}
        <div className={styles.row}>
          <dt>{texts.hours}</dt>
          <dd>{texts.hoursText}</dd>
        </div>
      </dl>
      {geo && (
        <MapEmbed
          lang={lang}
          point={geo}
          label={name}
        />
      )}
    </div>
  );
};
