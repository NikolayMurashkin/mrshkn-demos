import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { About } from '@/components/About';
import { Faq } from '@/components/Faq';
import { Finale } from '@/components/Finale';
import { Gallery } from '@/components/Gallery';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Program } from '@/components/Program';
import { Tickets } from '@/components/Tickets';
import { Venue } from '@/components/Venue';
import { LANGS } from '@/consts';
import { DEMOS } from '@/demo.config';
import { concertDate } from '@/lib/concert-date';
import { isDemoLang, langHref } from '@/lib/lang';
import type { LangPageProps } from '@/types';

/** Дата концерта скользит от сегодняшнего дня: страница рендерится на каждый запрос, а не один раз при сборке. */
export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: LangPageProps): Promise<Metadata> => {
  const { lang } = await params;

  return {
    alternates: {
      canonical: isDemoLang(lang) ? langHref(lang) : undefined,
      languages: { ...Object.fromEntries(LANGS.map((item) => [item, langHref(item)])), 'x-default': langHref('ru') },
    },
  };
};

const HomePage = async ({ params }: LangPageProps) => {
  const { lang } = await params;

  if (!isDemoLang(lang)) {
    notFound();
  }

  const date = concertDate(new Date());

  return (
    <>
      <Header lang={lang} />
      <main>
        <JsonLd data={buildBusinessJsonLd(DEMOS[lang])} />
        <Hero
          lang={lang}
          date={date}
        />
        <About lang={lang} />
        <Program lang={lang} />
        <Venue lang={lang} />
        <Tickets lang={lang} />
        <Faq lang={lang} />
        <Gallery lang={lang} />
        <Finale
          lang={lang}
          date={date}
        />
      </main>
    </>
  );
};

export default HomePage;
