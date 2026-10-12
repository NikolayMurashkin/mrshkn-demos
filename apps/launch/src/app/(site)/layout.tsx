import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { CONSENT_COOKIE, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { demoUrl, robotsMetadata } from '@mrshkn/demo-core/demo';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { CallToAction } from '@/components/CallToAction';
import { Colophon } from '@/components/Colophon';
import { SiteHeader } from '@/components/SiteHeader';
import { THEME_COLORS } from '@/consts';
import { DEMO } from '@/demo.config';
import { jetbrainsMono, terminalSans } from '@/styles/fonts';
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
  ],
};

const SiteLayout = async ({ children }: SiteLayoutProps) => {
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);

  return (
    <html
      lang="ru"
      className={`${jetbrainsMono.variable} ${terminalSans.variable}`}
    >
      <body>
        <JsonLd data={buildBusinessJsonLd(DEMO)} />
        <SiteHeader />
        {children}
        <CallToAction />
        <DemoFooter policyHref={POLICY_HREF}>
          <Colophon />
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
