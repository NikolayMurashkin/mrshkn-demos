import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { CONSENT_COOKIE } from '@mrshkn/demo-core/consts';
import { demoUrl, robotsMetadata } from '@mrshkn/demo-core/demo';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { DEFAULT_LANG } from '@/consts';
import { DEMO } from '@/demo.config';
import { isDemoLang, policyHref } from '@/lib/lang';
import { golosText, unbounded } from '@/styles/fonts';
import { TEXTS } from '@/texts';
import type { LangParams } from '@/types';
import styles from './layout.module.scss';
import '@/styles/globals.scss';

type LangLayoutProps = {
  children: ReactNode;
  params: LangParams;
};

/** Фон окна браузера — `bg` темы по системе, как у страницы. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f1f3' },
    { media: '(prefers-color-scheme: dark)', color: '#121114' },
  ],
  colorScheme: 'light dark',
};

export const generateMetadata = async ({ params }: { params: LangParams }): Promise<Metadata> => {
  const { lang } = await params;
  const { meta } = TEXTS[isDemoLang(lang) ? lang : DEFAULT_LANG];

  return {
    metadataBase: new URL(demoUrl(DEMO.slug)),
    title: { default: meta.title, template: `%s — ${meta.title}` },
    description: meta.description,
    robots: robotsMetadata(),
  };
};

const LangLayout = async ({ children, params }: LangLayoutProps) => {
  const { lang: param } = await params;
  const lang = isDemoLang(param) ? param : DEFAULT_LANG;
  const noticeClosed = (await cookies()).has(CONSENT_COOKIE);

  return (
    <html
      lang={lang}
      className={[unbounded.variable, golosText.variable].join(' ')}
    >
      <body>
        {children}
        <div className={styles.footer}>
          <DemoFooter
            lang={lang}
            policyHref={policyHref(lang)}
          />
        </div>
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
