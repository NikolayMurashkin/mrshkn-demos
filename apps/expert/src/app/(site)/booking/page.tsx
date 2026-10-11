import { POLICY_HREF } from '@mrshkn/demo-core/consts';
import { typograph } from '@mrshkn/demo-core/typograph';
import type { Metadata } from 'next';
import { BookingForm } from '@/components/BookingForm';
import { PageIntro } from '@/components/PageIntro';
import { getFormats } from '@/cms/queries';
import { BOOKING_PAGE, EXPERT } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText, formatMeta, formatPrice } from '@/lib/format';
import styles from './page.module.scss';

type BookingPageProps = {
  searchParams: Promise<{ format?: string | string[] }>;
};

export const metadata: Metadata = {
  title: BOOKING_PAGE.title,
};

const BookingPage = async ({ searchParams }: BookingPageProps) => {
  const [{ format }, formats] = await Promise.all([searchParams, getFormats()]);
  const { address } = DEMO.business;

  return (
    <main className={styles.page}>
      <PageIntro
        title={BOOKING_PAGE.title}
        aside={
          <>
            {address && <span className={styles.meta}>{addressText(address)}</span>}
            <span className={styles.meta}>{EXPERT.hours}</span>
          </>
        }
      />
      <div className={styles.layout}>
        <div className={styles.main}>
          <BookingForm
            formats={formats.map((item) => ({
              slug: item.slug,
              title: typograph(item.title),
              meta: typograph(formatMeta(item)),
              price: formatPrice(item.price),
            }))}
            selected={typeof format === 'string' ? format : undefined}
            policyHref={POLICY_HREF}
          />
        </div>
      </div>
    </main>
  );
};

export default BookingPage;
