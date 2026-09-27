import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { CONSENT_COOKIE, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { demoUrl, robotsMetadata } from '@mrshkn/demo-core/demo';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { DEMO } from '@/demo.config';
import '@/styles/globals.scss';

type SiteLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL(demoUrl(DEMO.slug)),
  title: DEMO.title,
  description: DEMO.description,
  robots: robotsMetadata(),
};

const SiteLayout = async ({ children }: SiteLayoutProps) => {
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);

  return (
    <html lang="ru">
      <body>
        {children}
        <DemoFooter policyHref={POLICY_HREF} />
        <CookieBanner
          policyHref={POLICY_HREF}
          initiallyVisible={!noticeClosed}
        />
      </body>
    </html>
  );
};

export default SiteLayout;
