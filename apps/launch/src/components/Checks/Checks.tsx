import styles from './Checks.module.scss';

type ChecksProps = {
  items: string[];
};

/** Список «сделано»: знак `[x]` цветом ok — пункт тарифа или изменение вышедшего релиза. */
export const Checks = ({ items }: ChecksProps) => (
  <ul className={styles.checks}>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);
