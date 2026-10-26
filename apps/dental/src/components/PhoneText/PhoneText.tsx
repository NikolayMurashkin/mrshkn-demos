import { Fragment } from 'react';
import styles from './PhoneText.module.scss';

type PhoneTextProps = {
  phone: string;
};

/**
 * Номер телефона, который переносится только по пробелам: группа цифр с дефисами не рвется на две строки.
 * Один элемент снаружи — в кнопке-flex номер остается одним блоком рядом со стрелкой.
 */
export const PhoneText = ({ phone }: PhoneTextProps) => (
  <span className={styles.phone}>
    {phone.split(' ').map((part, index) => (
      <Fragment key={`${part}-${index}`}>
        {index > 0 && ' '}
        <span className={styles.part}>{part}</span>
      </Fragment>
    ))}
  </span>
);
