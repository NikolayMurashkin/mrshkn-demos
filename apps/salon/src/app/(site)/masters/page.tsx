import type { Metadata } from 'next';
import { MasterCards } from '@/components/MasterCards';
import { PageIntro } from '@/components/PageIntro';
import { SitePlate } from '@/components/SitePlate';
import { getMasters } from '@/cms/queries';
import { MASTERS_PAGE } from '@/consts';
import styles from '../page.module.scss';

export const metadata: Metadata = {
  title: MASTERS_PAGE.title,
  description: MASTERS_PAGE.description,
};

/** Все мастера; пусто в CMS — вместо лида строка о том, что список обновляется, без пустой сетки. */
const MastersPage = async () => {
  const masters = await getMasters();

  return (
    <>
      <main className={styles.page}>
        <PageIntro
          title={MASTERS_PAGE.title}
          lead={masters.length > 0 ? MASTERS_PAGE.lead : MASTERS_PAGE.empty}
        />
        {masters.length > 0 && (
          <MasterCards
            masters={masters}
            nameTag="h2"
            priorityFirst
          />
        )}
      </main>
      <SitePlate />
    </>
  );
};

export default MastersPage;
