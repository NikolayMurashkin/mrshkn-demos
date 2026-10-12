import Link from 'next/link';
import { Checks } from '@/components/Checks';
import { SectionHead } from '@/components/SectionHead';
import { Window } from '@/components/Window';
import { HEADER_CTA, PRICING } from '@/consts';
import { formatPlanPrice } from '@/lib/format';
import styles from './Pricing.module.scss';

/** Тарифы карточками PlanCard: один выделен рамкой accent и главной кнопкой, без подписи «популярный». */
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
            <Link
              className={plan.accent ? styles.primary : styles.button}
              href={HEADER_CTA.href}
              prefetch={false}
            >
              {plan.cta}
            </Link>
          </Window>
        </li>
      ))}
    </ul>
  </section>
);
