import { LOYALTY_HREF, LOYALTY_LABEL, PLATE } from '../../consts';
import styles from './SitePlate.module.scss';

/** Плита над подвалом — вход в лояльность на главной и в меню; в компактном меню и на «Лояльности» ее нет. */
export const SitePlate = () => (
  <section
    className={styles.plate}
    aria-labelledby="plate-title"
  >
    <h2
      className={styles.title}
      id="plate-title"
    >
      {PLATE.title}
    </h2>
    <a
      className={styles.button}
      href={LOYALTY_HREF}
    >
      {LOYALTY_LABEL}
    </a>
  </section>
);
