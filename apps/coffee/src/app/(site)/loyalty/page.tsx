import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { StampCard } from '@/components/StampCard';
import { LOYALTY, MENU_HREF } from '@/consts';
import { getLoyaltyApps, getLoyaltyMessengers } from '@/lib/loyalty';
import styles from './page.module.scss';

/** Описание называет те же мессенджеры, что заголовок: адреса ботов читаются на запрос. */
export const generateMetadata = (): Metadata => ({
  title: LOYALTY.title,
  description: LOYALTY.description(getLoyaltyMessengers(getLoyaltyApps())),
});

/**
 * Кнопки ведут в Mini App у ботов кофейни: первая — главная, остальные и возврат в меню — контуром.
 * Без адресов ботов в окружении — заглушка и только возврат в меню, он и главный.
 */
const LoyaltyPage = () => {
  const apps = getLoyaltyApps();
  const hasApps = apps.length > 0;

  return (
    <>
      <SiteHeader current="loyalty" />
      <main className={styles.page}>
        <div className={styles.loyalty}>
          <div className={styles.body}>
            <h1 className={styles.title}>{LOYALTY.heading(getLoyaltyMessengers(apps))}</h1>
            <p className={styles.lead}>{hasApps ? LOYALTY.lead : LOYALTY.text}</p>
            <div className={styles.actions}>
              {apps.map(({ href, label }, index) => (
                <a
                  key={label}
                  className={index === 0 ? styles.primary : styles.button}
                  href={href}
                >
                  {label}
                </a>
              ))}
              <a
                className={hasApps ? styles.button : styles.primary}
                href={MENU_HREF}
              >
                {LOYALTY.back}
              </a>
            </div>
          </div>
          <StampCard />
        </div>
      </main>
    </>
  );
};

export default LoyaltyPage;
