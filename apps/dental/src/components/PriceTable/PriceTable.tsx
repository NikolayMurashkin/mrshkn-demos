import { typograph } from '@mrshkn/demo-core/typograph';
import { formatPrice } from '@/lib/format';
import type { Service } from '@/payload-types';
import styles from './PriceTable.module.scss';

type PriceTableProps = {
  /** Подпись таблицы для скринридера: чей это прайс. */
  caption: string;
  prices: Service['prices'];
};

export const PriceTable = ({ caption, prices }: PriceTableProps) => (
  <table className={styles.table}>
    <caption className={styles.caption}>{caption}</caption>
    <tbody>
      {prices.map((row, index) => (
        <tr
          key={row.id ?? index}
          className={styles.row}
        >
          <th
            className={styles.name}
            scope="row"
          >
            {typograph(row.name)}
          </th>
          <td className={styles.price}>{formatPrice(row.price, Boolean(row.from))}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
