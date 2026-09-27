import type { ReactNode } from 'react';
import styles from './BookingButton.module.scss';

type BookingButtonProps = {
  /** Якорь формы заявки на странице: запись до появления Mini App (B24). */
  formHref: string;
  miniAppUrl?: string;
  children: ReactNode;
};

export const BookingButton = ({ formHref, miniAppUrl, children }: BookingButtonProps) =>
  miniAppUrl ? (
    <a
      className={styles.button}
      href={miniAppUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ) : (
    <a
      className={styles.button}
      href={formHref}
    >
      {children}
    </a>
  );
