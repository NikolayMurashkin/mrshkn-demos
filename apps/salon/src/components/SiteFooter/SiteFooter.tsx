import { POLICY_HREF } from '@mrshkn/demo-core/consts';
import { CORE_TEXTS } from '@mrshkn/demo-core/texts';
import { SALON } from '@/consts';
import styles from './SiteFooter.module.scss';

/** Колофон над подписью демо: знак салона, адрес и часы, ссылка на политику. Подпись студии — у подвала ядра. */
export const SiteFooter = () => (
  <div className={styles.colophon}>
    <p className={styles.mark}>
      <span
        className={styles.name}
        translate="no"
      >
        {SALON.name}
      </span>
      <span className={styles.kind}>{SALON.kind}</span>
    </p>
    <p className={styles.meta}>
      <span>{SALON.address}</span>
      <span>{SALON.hours}</span>
    </p>
    <p className={styles.links}>
      <a href={POLICY_HREF}>{CORE_TEXTS.ru.footer.policy}</a>
    </p>
  </div>
);
