import { Fragment } from 'react';
import styles from './Command.module.scss';

type CommandProps = {
  command: string;
};

/**
 * Команда CLI: на узкой колонке переносится только между словами — «--to 5%» не рвется на «--» и «to», как сделал бы
 * браузер после дефиса.
 */
export const Command = ({ command }: CommandProps) =>
  command.split(' ').map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      {index > 0 && ' '}
      <span className={styles.word}>{word}</span>
    </Fragment>
  ));
