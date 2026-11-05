import type { DemoLang } from '@mrshkn/demo-core/types';
import { TEXTS } from '../../texts';
import { Section } from '../Section';
import styles from './Faq.module.scss';

type FaqProps = {
  lang: DemoLang;
};

/** Частые вопросы списком: вопросов три, ответы видны сразу, без раскрытия. */
export const Faq = ({ lang }: FaqProps) => {
  const texts = TEXTS[lang].faq;

  return (
    <Section
      id="faq"
      title={texts.title}
    >
      <dl className={styles.list}>
        {texts.items.map(({ q, a }) => (
          <div
            key={q}
            className={styles.item}
          >
            <dt className={styles.question}>{q}</dt>
            <dd className={styles.answer}>{a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
};
