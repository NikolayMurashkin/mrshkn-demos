import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { StampCard } from '@/components/StampCard';
import { LOYALTY, MENU_HREF } from '@/consts';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Карта лояльности',
  description: 'Каждая 10-я чашка — от нас. Карта лояльности в Telegram и MAX.',
};

/** Заглушка до приложения «Лояльность»: когда оно появится, кнопки поведут в него, страница останется запасным входом. */
const LoyaltyPage = () => (
  <>
    <SiteHeader current="loyalty" />
    <main className={styles.page}>
      <div className={styles.loyalty}>
        <div className={styles.body}>
          <h1 className={styles.title}>{LOYALTY.title}</h1>
          <p className={styles.lead}>{LOYALTY.text}</p>
          <a
            className={styles.button}
            href={MENU_HREF}
          >
            {LOYALTY.back}
          </a>
        </div>
        <StampCard />
      </div>
    </main>
  </>
);

export default LoyaltyPage;
