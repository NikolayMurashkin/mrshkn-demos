import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import type { ReactNode } from 'react';
import { BOOKING_CTA, BOOKING_FORM_HREF } from '@/consts';
import { DEMO } from '@/demo.config';
import styles from './BookingLink.module.scss';

type BookingLinkProps = {
  size?: 'sm' | 'lg';
  children?: ReactNode;
};

/**
 * Запись — BookingButton ядра: с ботом салона ведет в Mini App «Запись» (новая вкладка), без бота — к форме заявки
 * на странице записи. Обертка без своей коробки (`display: contents`) дает ссылке вид главной кнопки DS.
 */
export const BookingLink = ({ size = 'lg', children = BOOKING_CTA }: BookingLinkProps) => (
  <span className={size === 'sm' ? styles.sm : styles.lg}>
    <BookingButton
      formHref={BOOKING_FORM_HREF}
      miniAppUrl={DEMO.miniAppUrl}
    >
      {children}
    </BookingButton>
  </span>
);
