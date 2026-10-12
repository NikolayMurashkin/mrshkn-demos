import styles from './SectionHead.module.scss';

type SectionHeadProps = {
  titleId: string;
  title: string;
  note: string;
};

/** Головка секции главной: заголовок с маркером `##` и примечание `//` справа. */
export const SectionHead = ({ titleId, title, note }: SectionHeadProps) => (
  <div className={styles.head}>
    <h2
      className={styles.title}
      id={titleId}
    >
      {title}
    </h2>
    <p className={styles.note}>
      <span
        className={styles.mark}
        aria-hidden="true"
      >
        {'//'}
      </span>{' '}
      {note}
    </p>
  </div>
);
