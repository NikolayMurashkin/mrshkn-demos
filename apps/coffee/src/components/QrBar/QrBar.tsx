'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './QrBar.module.scss';

type QrBarProps = {
  children: ReactNode;
};

/**
 * Липкая строка чипов компактного меню. На узком экране выбранный чип может уйти за край строки — после загрузки
 * строка докручивается к первому выбранному. Это улучшение: без скрипта чип доступен прокруткой, список уже отфильтрован сервером.
 */
export const QrBar = ({ children }: QrBarProps) => {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bar.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, []);

  return (
    <div
      ref={bar}
      className={styles.bar}
    >
      {children}
    </div>
  );
};
