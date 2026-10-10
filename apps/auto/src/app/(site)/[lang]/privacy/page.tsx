import { CORE_TEXTS } from '@mrshkn/demo-core/texts';
import { PrivacyPolicy } from '@mrshkn/demo-core/components/PrivacyPolicy';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { LANGS } from '@/consts';
import { DEMOS } from '@/demo.config';
import { isDemoLang, policyHref } from '@/lib/lang';
import { TEXTS } from '@/texts';
import type { LangPageProps } from '@/types';
import styles from './page.module.scss';

export const generateMetadata = async ({ params }: LangPageProps): Promise<Metadata> => {
  const { lang } = await params;

  if (!isDemoLang(lang)) {
    return {};
  }

  return {
    title: CORE_TEXTS[lang].policy.title,
    alternates: {
      canonical: policyHref(lang),
      languages: Object.fromEntries(LANGS.map((item) => [item, policyHref(item)])),
    },
  };
};

const PrivacyPage = async ({ params }: LangPageProps) => {
  const { lang } = await params;

  if (!isDemoLang(lang)) {
    notFound();
  }

  return (
    <>
      <Header
        lang={lang}
        path="/privacy"
      />
      <main className={styles.page}>
        <p className={styles.mark}>{TEXTS[lang].privacy.mark}</p>
        <div className={styles.text}>
          <PrivacyPolicy
            lang={lang}
            withYandexReviews={false}
            withYandexMap={Boolean(DEMOS[lang].business.geo)}
          />
        </div>
      </main>
    </>
  );
};

export default PrivacyPage;
