import { typograph } from '@mrshkn/demo-core/typograph';
import { formatPrice } from '@/lib/format';
import type { Service } from '@/payload-types';
import styles from './PriceTable.module.scss';

type PriceTableProps = {
  /** Подпись таблицы для скринридера: чей это прайс. */
  caption: string;
  prices: Service['prices'];
};

/** Прайс услуги таблицей с заголовками колонок; вид — строки PlanRow DS: шапка кикером, линии между строками. */
export const PriceTable = ({ caption, prices }: PriceTableProps) => (
  <table className={styles.table}>
    <caption className={styles.caption}>{caption}</caption>
    <thead>
      <tr className={styles.head}>
        <th
          className={styles.headName}
          scope="col"
        >
          Услуга
        </th>
        <th
          className={styles.headPrice}
          scope="col"
        >
          Цена
        </th>
      </tr>
    </thead>
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
