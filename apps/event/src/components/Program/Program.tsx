import type { DemoLang } from '@mrshkn/demo-core/types';
import { splitProgramItem } from '../../lib/program';
import { TEXTS } from '../../texts';
import { Section } from '../Section';
import styles from './Program.module.scss';

type ProgramProps = {
  lang: DemoLang;
};

/** Программа вечера по времени: время — крупно слева, что происходит — справа. */
export const Program = ({ lang }: ProgramProps) => {
  const texts = TEXTS[lang].program;

  return (
    <Section
      id="program"
      title={texts.title}
    >
      <ol className={styles.list}>
        {texts.items.map((item) => {
          const { time, text } = splitProgramItem(item);

          return (
            <li
              key={item}
              className={styles.item}
            >
              <span className={styles.time}>{time}</span>
              <span className={styles.text}>{text}</span>
            </li>
          );
        })}
      </ol>
    </Section>
  );
};
