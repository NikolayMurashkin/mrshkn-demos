import type { ReactNode } from 'react';
import styles from './BookingButton.module.scss';

/** Адрес MAX и подпись — оба или ни одного: ссылка без подписи осталась бы без доступного имени. */
type BookingButtonMaxProps =
  | { maxAppUrl?: undefined; maxLabel?: undefined }
  | {
      /** Адрес Mini App «Запись» в MAX: с ним за главной ссылкой идет вторая, контуром, в новой вкладке. */
      maxAppUrl: string | undefined;
      /** Подпись ссылки в MAX. */
      maxLabel: NonNullable<ReactNode>;
    };

type BookingButtonProps = {
  /** Якорь формы заявки на странице: запись, пока у демо нет Mini App «Запись». */
  formHref: string;
  miniAppUrl?: string;
  children: ReactNode;
} & BookingButtonMaxProps;

/** Ссылки записи — соседи без обертки: родители раскладывают их своим `.actions > a`. */
export const BookingButton = ({ formHref, miniAppUrl, maxAppUrl, maxLabel, children }: BookingButtonProps) => (
  <>
    {miniAppUrl ? (
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
    )}
    {maxAppUrl && (
      <a
        className={styles.outline}
        href={maxAppUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {maxLabel}
      </a>
    )}
  </>
);
