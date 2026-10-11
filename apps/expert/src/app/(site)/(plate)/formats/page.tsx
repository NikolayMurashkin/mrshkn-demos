import type { Metadata } from 'next';
import { FormatList } from '@/components/FormatList';
import { PageIntro } from '@/components/PageIntro';
import { getFormats } from '@/cms/queries';
import { FORMATS_PAGE } from '@/consts';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: FORMATS_PAGE.title,
  description: FORMATS_PAGE.lead,
};

const FormatsPage = async () => {
  const formats = await getFormats();

  return (
    <main className={styles.page}>
      <PageIntro
        title={FORMATS_PAGE.title}
        lead={FORMATS_PAGE.lead}
      />
      <div className={styles.stack}>
        <FormatList formats={formats} />
        <aside
          className={styles.rules}
          aria-labelledby="rules-title"
        >
          <h2
            className={styles.rulesTitle}
            id="rules-title"
          >
            {FORMATS_PAGE.rulesTitle}
          </h2>
          <p className={styles.rulesText}>{FORMATS_PAGE.rules}</p>
        </aside>
      </div>
    </main>
  );
};

export default FormatsPage;
