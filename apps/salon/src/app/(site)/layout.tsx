import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { CONSENT_COOKIE, POLICY_HREF } from '@mrshkn/demo-core/consts';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { siteMetadata } from '@/lib/metadata';
import { commissioner, delaGothicOne } from '@/styles/fonts';
import '@/styles/globals.scss';

type SiteLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = siteMetadata;

/** Тема у демо одна — темная: цвет панели браузера совпадает с фоном страницы. */
export const viewport: Viewport = {
  themeColor: '#0e0a12',
  colorScheme: 'dark',
};

const SiteLayout = async ({ children }: SiteLayoutProps) => {
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);

  return (
    <html
      lang="ru"
      className={`${delaGothicOne.variable} ${commissioner.variable}`}
    >
      <body>
        <SiteHeader />
        {children}
        <DemoFooter
          policyHref={POLICY_HREF}
          layout="colophon"
        >
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
