import { typograph } from '@mrshkn/demo-core/typograph';
import styles from './SectionHead.module.scss';

type SectionHeadProps = {
  id: string;
  rubric: string;
  title: string;
};

/** Головка секции главной (`e-section__head` DS): рубрика — метка и линейка до края, под ней заголовок `h2`. */
export const SectionHead = ({ id, rubric, title }: SectionHeadProps) => (
  <div className={styles.head}>
    <p className={styles.rubric}>
      <span className={styles.label}>{typograph(rubric)}</span>
    </p>
    <h2
      className={styles.title}
      id={id}
    >
      {title}
    </h2>
  </div>
);
