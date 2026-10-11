import { EXPERT } from '@/consts';
import { DEMO } from '@/demo.config';
import { addressText } from '@/lib/format';
import styles from './Colophon.module.scss';

/** Колофон над подписью демо: имя, подпись, адрес кабинета и часы. Подпись «Демо-проект студии» ставит ядро. */
export const Colophon = () => {
  const { address } = DEMO.business;

  return (
    <div className={styles.colophon}>
      <span className={styles.mark}>{EXPERT.name}</span>
      <span>{EXPERT.role}</span>
      {address && <span>{addressText(address)}</span>}
      <span>{EXPERT.hours}</span>
    </div>
  );
};
