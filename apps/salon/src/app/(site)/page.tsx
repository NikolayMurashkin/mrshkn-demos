import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import { CategoryTiles } from '@/components/CategoryTiles';
import { Hero } from '@/components/Hero';
import { MasterCards } from '@/components/MasterCards';
import { Quotes } from '@/components/Quotes';
import { Section } from '@/components/Section';
import { SitePlate } from '@/components/SitePlate';
import { getMasters, getReviews, getServices } from '@/cms/queries';
import { HOME, HOME_MASTERS, HOME_REVIEWS, MASTERS_HREF, REVIEWS_HREF } from '@/consts';
import { DEMO } from '@/demo.config';
import { priceGroups } from '@/lib/prices';

/** Главная: первый экран, направления с ценами «от», мастера, отзывы и плита записи. Пустой раздел не выводится. */
const HomePage = async () => {
  const [services, masters, reviews] = await Promise.all([getServices(), getMasters(), getReviews()]);
  const groups = priceGroups(services);

  return (
    <>
      <main>
        <JsonLd data={buildBusinessJsonLd(DEMO)} />
        <Hero />
        {groups.length > 0 && (
          <Section
            id="services"
            title={HOME.servicesTitle}
            note={HOME.servicesNote}
          >
            <CategoryTiles groups={groups} />
          </Section>
        )}
        {masters.length > 0 && (
          <Section
            id="masters"
            title={HOME.mastersTitle}
            more={{ href: MASTERS_HREF, label: HOME.mastersAll }}
          >
            <MasterCards masters={masters.slice(0, HOME_MASTERS)} />
          </Section>
        )}
        {reviews.length > 0 && (
          <Section
            id="reviews"
            title={HOME.reviewsTitle}
            more={{ href: REVIEWS_HREF, label: HOME.reviewsAll }}
          >
            <Quotes reviews={reviews.slice(0, HOME_REVIEWS)} />
          </Section>
        )}
      </main>
      <SitePlate />
    </>
  );
};

export default HomePage;
