import styles from './PageIntro.module.scss';

type PageIntroProps = {
  title: string;
  lead?: string;
};

/** Головка внутренней страницы: H1 Dela и лид. */
export const PageIntro = ({ title, lead }: PageIntroProps) => (
  <header className={styles.intro}>
    <h1 className={styles.title}>{title}</h1>
    {lead && <p className={styles.lead}>{lead}</p>}
  </header>
);
