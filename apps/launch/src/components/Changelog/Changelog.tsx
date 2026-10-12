import { Checks } from '@/components/Checks';
import { SectionHead } from '@/components/SectionHead';
import { CHANGELOG } from '@/consts';
import styles from './Changelog.module.scss';

/** Последние релизы: версия и дата слева, что изменилось — справа. */
export const Changelog = () => (
  <section
    className={styles.section}
    id={CHANGELOG.id}
    aria-labelledby={`${CHANGELOG.id}-title`}
  >
    <SectionHead
      titleId={`${CHANGELOG.id}-title`}
      title={CHANGELOG.title}
      note={CHANGELOG.note}
    />
    <ol className={styles.releases}>
      {CHANGELOG.releases.map((release) => (
        <li
          key={release.version}
          className={styles.release}
        >
          <p className={styles.meta}>
            <span className={styles.version}>{release.version}</span>
            <time
              className={styles.date}
              dateTime={release.date}
            >
              {release.dateText}
            </time>
          </p>
          <div className={styles.body}>
            <h3 className={styles.title}>{release.title}</h3>
            <Checks items={release.items} />
          </div>
        </li>
      ))}
    </ol>
  </section>
);
