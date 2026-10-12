import { Command } from '@/components/Command';
import { SectionHead } from '@/components/SectionHead';
import { FEATURES } from '@/consts';
import styles from './Features.module.scss';

/** Возможности продукта: у каждой — команда CLI, которой она включается. */
export const Features = () => (
  <section
    className={styles.section}
    id={FEATURES.id}
    aria-labelledby={`${FEATURES.id}-title`}
  >
    <SectionHead
      titleId={`${FEATURES.id}-title`}
      title={FEATURES.title}
      note={FEATURES.note}
    />
    <ul className={styles.features}>
      {FEATURES.items.map((feature) => (
        <li
          key={feature.title}
          className={styles.feature}
        >
          <h3 className={styles.title}>{feature.title}</h3>
          <p className={styles.text}>{feature.text}</p>
          <code
            className={styles.command}
            translate="no"
          >
            <span
              className={styles.sign}
              aria-hidden="true"
            >
              ${' '}
            </span>
            <Command command={feature.command} />
          </code>
        </li>
      ))}
    </ul>
  </section>
);
