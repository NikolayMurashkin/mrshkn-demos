import { Checks } from '@/components/Checks';
import { SectionHead } from '@/components/SectionHead';
import { Window } from '@/components/Window';
import { PRICING } from '@/consts';
import { formatPlanPrice } from '@/lib/format';
import styles from './Pricing.module.scss';

/**
 * Тарифы карточками PlanCard: один выделен рамкой accent и главной кнопкой, без подписи «популярный». Кнопки ведут
 * к форме списка ожидания в плите над подвалом — она есть на каждой странице, якорь работает и без JS.
 */
export const Pricing = () => (
  <section
    className={styles.section}
    id={PRICING.id}
    aria-labelledby={`${PRICING.id}-title`}
  >
    <SectionHead
      titleId={`${PRICING.id}-title`}
      title={PRICING.title}
      note={PRICING.note}
    />
    <ul className={styles.plans}>
      {PRICING.plans.map((plan) => (
        <li
          key={plan.id}
          className={styles.item}
        >
          <Window
            className={styles.plan}
            accent={plan.accent}
            bare
          >
            <div className={styles.head}>
              <h3 className={styles.name}>{plan.name}</h3>
              <p className={styles.summary}>{plan.summary}</p>
            </div>
            <p className={styles.price}>
              <span className={styles.amount}>{formatPlanPrice(plan)}</span>
              <span className={styles.term}>{plan.term}</span>
            </p>
            <Checks items={plan.points} />
            <a
              className={plan.accent ? styles.primary : styles.button}
              href={PRICING.href}
            >
              {plan.cta}
            </a>
          </Window>
        </li>
      ))}
    </ul>
  </section>
);
