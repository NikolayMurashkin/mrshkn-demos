import config from '@payload-config';
import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import { getPayload } from 'payload';
import { getMenuItems } from '@/cms/queries';
import { MENU_CATEGORIES } from '@/cms/seed/data';
import { Hero } from '@/components/Hero';
import { Picks } from '@/components/Picks';
import { SiteHeader } from '@/components/SiteHeader';
import { SitePlate } from '@/components/SitePlate';
import { VisitSection } from '@/components/VisitSection';
import { DEMO } from '@/demo.config';
import styles from './page.module.scss';

const HomePage = async () => {
  const items = await getMenuItems(await getPayload({ config }));

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <JsonLd data={buildBusinessJsonLd(DEMO)} />
        <Hero />
        <Picks
          items={items}
          categories={MENU_CATEGORIES}
        />
        <VisitSection />
      </main>
      <SitePlate />
    </>
  );
};

export default HomePage;
