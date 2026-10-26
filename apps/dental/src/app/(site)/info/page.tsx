import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import { NBSP } from '@mrshkn/demo-core/consts';
import type { Metadata } from 'next';
import { LicenseInfo } from '@/components/LicenseInfo';
import { LicenseQr } from '@/components/LicenseQr';
import { OrganizationInfo } from '@/components/OrganizationInfo';
import { PageIntro } from '@/components/PageIntro';
import { RuleList } from '@/components/RuleList';
import { Section } from '@/components/Section';
import {
  BOOKING_RULES,
  DIRECTIONS_TEXT,
  INFO,
  LICENSE,
  PAID_SERVICES_RULES,
  PRICES_HREF,
  PRICES_LINK_TEXT,
} from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText } from '@/lib/format';
import { qrSvg } from '@/lib/qr';
import styles from '../content.module.scss';

export const metadata: Metadata = {
  title: INFO.title,
  description: `Реквизиты, лицензия с${NBSP}QR-кодом реестра, адрес, правила записи на${NBSP}первый прием и${NBSP}платных услуг.`,
};

/** Сведения, которые клиника обязана показывать на сайте: реквизиты, лицензия, проезд, правила. */
const InfoPage = async () => {
  const { address, geo, name } = DEMO.business;
  const qr = await qrSvg(LICENSE.registryUrl);

  return (
    <>
      <PageIntro
        label={INFO.label}
        title={INFO.title}
        lead={INFO.lead}
      />
      <Section
        id="organization"
        label={INFO.organization.label}
        title={INFO.organization.title}
      >
        <OrganizationInfo />
      </Section>
      <Section
        id="license"
        label={INFO.license.label}
        title={INFO.license.title}
      >
        <LicenseInfo />
        <LicenseQr svg={qr} />
      </Section>
      <Section
        id="directions"
        label={INFO.directions.label}
        title={INFO.directions.title}
      >
        <div className={styles.text}>
          {address && <p>{addressText(address)}</p>}
          <p>{DIRECTIONS_TEXT}</p>
        </div>
        {geo && (
          <MapEmbed
            point={geo}
            label={`${name} на${NBSP}карте`}
          />
        )}
      </Section>
      <Section
        id="booking-rules"
        label={INFO.bookingRules.label}
        title={INFO.bookingRules.title}
      >
        <RuleList rules={BOOKING_RULES} />
      </Section>
      <Section
        id="paid-rules"
        label={INFO.paidRules.label}
        title={INFO.paidRules.title}
      >
        <p className={styles.note}>{INFO.paidRules.lead}</p>
        <RuleList
          rules={PAID_SERVICES_RULES}
          link={{ text: PRICES_LINK_TEXT, href: PRICES_HREF }}
        />
      </Section>
    </>
  );
};

export default InfoPage;
