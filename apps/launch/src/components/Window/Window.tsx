import type { ReactNode } from 'react';
import styles from './Window.module.scss';

type WindowProps = {
  /** Подпись в строке заголовка: имя файла или команды. Без нее строка — только три точки. */
  title?: string;
  /** Без строки заголовка: карточка тарифа — окно без точек, как PlanCard в DS. */
  bare?: boolean;
  accent?: boolean;
  className?: string;
  children: ReactNode;
};

/** Окно Terminal — повторяющаяся поверхность сущностей: лог раскатки, тариф. */
export const Window = ({ title, bare = false, accent = false, className, children }: WindowProps) => (
  <div className={[styles.window, accent && styles.accent, className].filter(Boolean).join(' ')}>
    {!bare && (
      <div className={styles.bar}>
        <span
          className={styles.dots}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </span>
        {title && <span className={styles.title}>{title}</span>}
      </div>
    )}
    {children}
  </div>
);
