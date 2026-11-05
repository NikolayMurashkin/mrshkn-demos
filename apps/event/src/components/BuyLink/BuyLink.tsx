import type { ReactNode } from 'react';
import { AFISHA_URL, EXTERNAL_LINK } from '../../consts';
import { ArrowOut } from '../ArrowOut';
import styles from './BuyLink.module.scss';

type BuyLinkProps = {
  children: ReactNode;
  /** `primary` — главная кнопка экрана, `outline` — контур, `primary-on-ink` — главная на плите `ink`. */
  variant?: 'primary' | 'outline' | 'primary-on-ink';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
};

/** «Купить билет» — всегда на Яндекс Афишу, в новой вкладке: эта страница остается открытой. */
export const BuyLink = ({ children, variant = 'outline', size = 'base', className }: BuyLinkProps) => (
  <a
    className={[styles.link, styles[variant], styles[size], className].filter(Boolean).join(' ')}
    href={AFISHA_URL}
    {...EXTERNAL_LINK}
  >
    {children}
    <ArrowOut />
  </a>
);
