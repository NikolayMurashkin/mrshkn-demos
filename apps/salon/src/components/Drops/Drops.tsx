import styles from './Drops.module.scss';

type DropsProps = {
  /** `hero` — сцена первого экрана, `small` — две капли в углу плиты. */
  variant?: 'hero' | 'small';
};

/** Сцена «капля лака»: глянцевые капли на градиентах токенов, только CSS, декоративная. */
export const Drops = ({ variant = 'hero' }: DropsProps) => (
  <div
    className={variant === 'hero' ? styles.stage : styles.small}
    aria-hidden="true"
  >
    <span className={styles.cherry} />
    <span className={styles.main} />
    <span className={styles.peach} />
    <span className={styles.dot} />
  </div>
);
