import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { CONSENT_COOKIE } from '@mrshkn/demo-core/consts';
import { demoUrl, robotsMetadata } from '@mrshkn/demo-core/demo';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { DEFAULT_LANG } from '@/consts';
import { DEMO, DEMOS } from '@/demo.config';
import { isDemoLang, policyHref } from '@/lib/lang';
import { sofiaSans, sofiaSansExtraCondensed, sofiaSansSemiCondensed } from '@/styles/fonts';
import { TEXTS } from '@/texts';
import type { LangParams } from '@/types';
import styles from './layout.module.scss';
import '@/styles/globals.scss';

type LangLayoutProps = {
  children: ReactNode;
  params: LangParams;
};

export const viewport: Viewport = {
  themeColor: '#0e1b2a',
  colorScheme: 'dark',
};

export const generateMetadata = async ({ params }: { params: LangParams }): Promise<Metadata> => {
  const { lang } = await params;
  const demo = DEMOS[isDemoLang(lang) ? lang : DEFAULT_LANG];

  return {
    metadataBase: new URL(demoUrl(DEMO.slug)),
    title: { default: demo.title, template: `%s — ${demo.business.name}` },
    description: demo.description,
    robots: robotsMetadata(),
  };
};

const LangLayout = async ({ children, params }: LangLayoutProps) => {
  const { lang: param } = await params;
  const lang = isDemoLang(param) ? param : DEFAULT_LANG;
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);
  const fonts = [sofiaSans, sofiaSansSemiCondensed, sofiaSansExtraCondensed].map(({ variable }) => variable);

  return (
    <html
      lang={lang}
      className={fonts.join(' ')}
    >
      <body>
        {children}
        <DemoFooter
          lang={lang}
          policyHref={policyHref(lang)}
        >
          <p className={styles.footerNote}>{TEXTS[lang].footer.fictional}</p>
        </DemoFooter>
        <CookieBanner
          lang={lang}
          policyHref={policyHref(lang)}
          initiallyVisible={!noticeClosed}
        />
      </body>
    </html>
  );
};

export default LangLayout;
