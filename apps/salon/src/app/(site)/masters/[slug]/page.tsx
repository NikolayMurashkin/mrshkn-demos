import { paragraphs, typograph } from '@mrshkn/demo-core/typograph';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookingLink } from '@/components/BookingLink';
import { BackIcon } from '@/components/Icons';
import { MasterPhoto } from '@/components/MasterPhoto';
import { PriceGroups } from '@/components/PriceGroups';
import { Quotes } from '@/components/Quotes';
import { SitePlate } from '@/components/SitePlate';
import { Works } from '@/components/Works';
import { getMasters, getReviews, getServices } from '@/cms/queries';
import { MASTER_PAGE, MASTER_PORTRAIT_SIZES, MASTER_WORKS, MASTERS_HREF } from '@/consts';
import { bookingLabel, formatYears } from '@/lib/format';
import { priceGroups } from '@/lib/prices';
import shared from '../../page.module.scss';
import styles from './page.module.scss';

type MasterPageProps = {
  params: Promise<{ slug: string }>;
};

const findMaster = async (slug: string) => (await getMasters()).find((master) => master.slug === slug);

export const generateMetadata = async ({ params }: MasterPageProps): Promise<Metadata> => {
  const master = await findMaster((await params).slug);

  return master
    ? { title: master.name, description: `${master.name}, ${master.role}. ${formatYears(master.years)}.` }
    : {};
};

/** Мастер: портрет, рассказ, услуги его направлений, снимки работ и отзывы о нем. Пусто — нет и раздела. */
const MasterPage = async ({ params }: MasterPageProps) => {
  const master = await findMaster((await params).slug);

  if (!master) {
    notFound();
  }

  const [services, reviews] = await Promise.all([getServices(), getReviews()]);
  const groups = priceGroups(services, master.categories);
  const masterReviews = reviews.filter((review) => review.master?.slug === master.slug);
  const works = Object.hasOwn(MASTER_WORKS, master.slug) ? MASTER_WORKS[master.slug] : [];

  return (
    <>
      <main className={shared.page}>
        <a
          className={styles.back}
          href={MASTERS_HREF}
        >
          <BackIcon />
          <span>{MASTER_PAGE.back}</span>
        </a>
        <header className={styles.head}>
          <MasterPhoto
            photo={master.photo}
            sizes={MASTER_PORTRAIT_SIZES}
            priority
            className={styles.portrait}
          />
          <div className={styles.body}>
            <p className={styles.role}>{typograph(master.role)}</p>
            <h1 className={styles.name}>{master.name}</h1>
            <p className={styles.tag}>{formatYears(master.years)}</p>
            {paragraphs(master.about).map((paragraph) => (
              <p
                key={paragraph}
                className={styles.about}
              >
                {paragraph}
              </p>
            ))}
            <div className={styles.actions}>
              <BookingLink>{bookingLabel(master.nameDative)}</BookingLink>
            </div>
          </div>
        </header>
        <PriceGroups
          groups={groups}
          withText={false}
        />
        {works.length > 0 && (
          <section
            className={styles.section}
            aria-labelledby="master-works-title"
          >
            <h2
              className={styles.title}
              id="master-works-title"
            >
              {MASTER_PAGE.works}
            </h2>
            <Works works={works} />
          </section>
        )}
        {masterReviews.length > 0 && (
          <section
            className={styles.section}
            aria-labelledby="master-reviews-title"
          >
            <h2
              className={styles.title}
              id="master-reviews-title"
            >
              {MASTER_PAGE.reviews}
            </h2>
            <Quotes reviews={masterReviews} />
          </section>
        )}
      </main>
      <SitePlate />
    </>
  );
};

export default MasterPage;
