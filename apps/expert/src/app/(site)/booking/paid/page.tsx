import config from '@payload-config';
import { typograph } from '@mrshkn/demo-core/typograph';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { cache } from 'react';
import { Arrow } from '@/components/Arrow';
import { PAID_PAGE } from '@/consts';
import { formatMeta, formatPrice } from '@/lib/format';
import { confirmBookingPayment } from '@/payment/confirm';
import { BOOKING_ID_PATTERN, PAID_PATH } from '@/payment/consts';
import styles from './page.module.scss';

type PaidPageProps = {
  searchParams: Promise<{ booking?: string | string[] }>;
};

const ROBOTS: Metadata['robots'] = { index: false, follow: false };

const findBooking = async (id: string) => {
  const payload = await getPayload({ config });

  return payload.findByID({ collection: 'bookings', id: Number(id), depth: 1, disableErrors: true });
};

/**
 * Запись по id из адреса. Пока запись ждет оплаты, страница сама спрашивает API ЮKassa тем же подтверждением, что
 * и уведомление: на локальной сборке уведомление песочницы до сервера не доходит. Сообщение в Telegram уйдет одно —
 * от того, кто первым перевел запись. `cache` — один запрос к API на открытие страницы: запись нужна и заголовку
 * вкладки, и самой странице.
 */
const loadBooking = cache(async (id: string | string[] | undefined) => {
  if (typeof id !== 'string' || !BOOKING_ID_PATTERN.test(id)) {
    return null;
  }

  const booking = await findBooking(id);

  if (booking?.status !== 'pending' || !booking.paymentId) {
    return booking;
  }

  await confirmBookingPayment(await getPayload({ config }), booking.paymentId);

  return (await findBooking(id)) ?? booking;
});

export const generateMetadata = async ({ searchParams }: PaidPageProps): Promise<Metadata> => {
  const booking = await loadBooking((await searchParams).booking);

  if (!booking) {
    return { robots: ROBOTS };
  }

  return { title: booking.status === 'paid' ? PAID_PAGE.paidTitle : PAID_PAGE.pendingTitle, robots: ROBOTS };
};

const PaidPage = async ({ searchParams }: PaidPageProps) => {
  const booking = await loadBooking((await searchParams).booking);

  if (!booking) {
    notFound();
  }

  const links = PAID_PAGE.links.map(({ href, label }) => (
    <Link
      key={href}
      className={styles.link}
      href={href}
      prefetch={false}
    >
      {label}
      <Arrow />
    </Link>
  ));

  const format = typeof booking.format === 'object' ? booking.format : null;

  return (
    <main className={styles.page}>
      {booking.status === 'paid' ? (
        <section
          className={styles.layout}
          aria-labelledby="page-title"
        >
          <div className={styles.main}>
            <h1
              className={styles.title}
              id="page-title"
            >
              {PAID_PAGE.paidTitle}
            </h1>
            <p className={`${styles.lead} ${styles.dropcap}`}>{PAID_PAGE.paidText}</p>
            {format && (
              <p className={styles.option}>
                <span className={styles.line}>
                  <span className={styles.name}>{typograph(format.title)}</span>
                  <span
                    className={styles.leader}
                    aria-hidden="true"
                  />
                </span>
                <span className={styles.price}>{formatPrice(booking.amount)}</span>
                <span className={styles.note}>{typograph(formatMeta(format))}</span>
              </p>
            )}
            <div className={styles.links}>{links}</div>
          </div>
        </section>
      ) : (
        <section
          className={styles.layout}
          aria-labelledby="page-title"
        >
          <div className={styles.main}>
            <h1
              className={styles.title}
              id="page-title"
            >
              {PAID_PAGE.pendingTitle}
            </h1>
            <p className={styles.lead}>{PAID_PAGE.pendingText}</p>
            <div className={styles.links}>
              <Link
                className={styles.link}
                href={`${PAID_PATH}?booking=${booking.id}`}
                prefetch={false}
              >
                {PAID_PAGE.refresh}
              </Link>
              {links}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default PaidPage;
