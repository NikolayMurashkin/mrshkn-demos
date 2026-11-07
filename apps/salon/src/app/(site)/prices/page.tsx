import type { Metadata } from 'next';
import { PageIntro } from '@/components/PageIntro';
import { PriceGroups } from '@/components/PriceGroups';
import { SitePlate } from '@/components/SitePlate';
import { getServices } from '@/cms/queries';
import { PRICES_PAGE } from '@/consts';
import { priceGroups } from '@/lib/prices';
import styles from '../page.module.scss';

export const metadata: Metadata = {
  title: PRICES_PAGE.title,
  description: PRICES_PAGE.description,
};

/**
 * Прайс по направлениям; якорь группы — код направления, на него ведут плитки главной. Услуг нет — вместо лида строка
 * о том, что прайс обновляется.
 */
const PricesPage = async () => {
  const groups = priceGroups(await getServices());

  return (
    <>
      <main className={styles.page}>
        <PageIntro
          title={PRICES_PAGE.title}
          lead={groups.length > 0 ? PRICES_PAGE.lead : PRICES_PAGE.empty}
        />
        <PriceGroups groups={groups} />
      </main>
      <SitePlate />
    </>
  );
};

export default PricesPage;
