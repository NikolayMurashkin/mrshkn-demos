import { Fragment } from 'react';
import { GROUP_BREAKS, HAS_DIGIT } from './consts';
import styles from './NumberText.module.scss';

type NumberTextProps = {
  text: string;
};

type NumberGroupProps = {
  part: string;
};

const NumberGroup = ({ part }: NumberGroupProps) => {
  const segments = part.split(GROUP_BREAKS);

  if (segments.length === 1) {
    return <span className={styles.group}>{part}</span>;
  }

  return (
    <span className={styles.group}>
      {segments.map((segment, index) => (
        <Fragment key={`${segment}-${index}`}>
          {index > 0 && <wbr />}
          <span className={styles.segment}>{segment}</span>
        </Fragment>
      ))}
    </span>
  );
};

/**
 * Текст, где группы с цифрами — время, номера, даты — не рвутся внутри: «9:00–21:00» не делится по тире,
 * «Л041-00000-39/00000000» — по дефису. Перенос — по пробелам между группами. Группа целиком не помещается
 * в строку — перенос после «№ » и после косой, части остаются целыми; поместилась — точки переноса не действуют.
 * Часть шире колонки переносится внутри по правилам родителя, а не вылезает.
 */
export const NumberText = ({ text }: NumberTextProps) =>
  text.split(' ').map((part, index) => (
    <Fragment key={`${part}-${index}`}>
      {index > 0 && ' '}
      {HAS_DIGIT.test(part) ? <NumberGroup part={part} /> : part}
    </Fragment>
  ));
