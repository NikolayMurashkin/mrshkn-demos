import type { ReactNode } from 'react';
import styles from './PageBlock.module.scss';

type PageBlockProps = {
  id: string;
  title: string;
  children: ReactNode;
};

/** Раздел внутренней страницы — блок кейса: H2 на полях над линейкой `ink`, содержимое (4–10) над линейкой `line`. */
export const PageBlock = ({ id, title, children }: PageBlockProps) => (
  <section aria-labelledby={`${id}-title`}>
    <div className={styles.block}>
      <div className={styles.aside}>
        <h2
          className={styles.title}
          id={`${id}-title`}
        >
          {title}
        </h2>
      </div>
      <div className={styles.main}>{children}</div>
    </div>
  </section>
);
