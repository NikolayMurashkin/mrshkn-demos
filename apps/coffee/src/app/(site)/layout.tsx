import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { CONSENT_COOKIE, POLICY_HREF } from '@mrshkn/demo-core/consts';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { siteMetadata } from '@/lib/metadata';
import { rubik } from '@/styles/fonts';
import '@/styles/globals.scss';

type SiteLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = siteMetadata;

/** Шапки здесь нет: ее рисует страница — компактное меню по QR-коду (`/menu?qr=1`) обходится без нее. */
const SiteLayout = async ({ children }: SiteLayoutProps) => {
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);

  return (
    <html
      lang="ru"
      className={rubik.className}
    >
      <body>
        {children}
        <DemoFooter policyHref={POLICY_HREF}>
          <SiteFooter />
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
