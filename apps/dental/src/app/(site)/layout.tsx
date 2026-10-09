import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { CONSENT_COOKIE, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { demoUrl, robotsMetadata } from '@mrshkn/demo-core/demo';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { BookingSection } from '@/components/BookingSection';
import { ClinicFooter } from '@/components/ClinicFooter';
import { FooterBand } from '@/components/FooterBand';
import { Header } from '@/components/Header';
import { DEMO } from '@/demo.config';
import { geologica } from '@/styles/fonts';
import styles from './layout.module.scss';
import '@/styles/globals.scss';

type SiteLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL(demoUrl(DEMO.slug)),
  title: { default: DEMO.title, template: `%s — ${DEMO.business.name}` },
  description: DEMO.description,
  robots: robotsMetadata(),
};

const SiteLayout = async ({ children }: SiteLayoutProps) => {
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);

  return (
    <html
      lang="ru"
      className={geologica.className}
    >
      <body>
        <JsonLd data={buildBusinessJsonLd(DEMO)} />
        <Header />
        <main className={styles.main}>
          {children}
          <BookingSection />
        </main>
        <FooterBand />
        <DemoFooter policyHref={POLICY_HREF}>
          <ClinicFooter />
        </DemoFooter>
        <CookieBanner
          policyHref={POLICY_HREF}
          initiallyVisible={!noticeClosed}
        />
      </body>
    </html>
  );
};

export default SiteLayout;
