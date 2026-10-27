import { typograph } from '@mrshkn/demo-core/typograph';
import { formatPrice } from '@/lib/format';
import type { Service } from '@/payload-types';
import styles from './PriceTable.module.scss';

type PriceTableProps = {
  /** Подпись таблицы для скринридера: чей это прайс. */
  caption: string;
  prices: Service['prices'];
};

/**
 * Прайс услуги таблицей с заголовками колонок; вид — строки PlanRow DS: шапка кикером, линии между строками.
 * Роли — явные: в крупном шрифте на узком экране таблица раскладывается блоками, и старые WebKit и VoiceOver
 * без ролей перестают читать ее как таблицу.
 */
export const PriceTable = ({ caption, prices }: PriceTableProps) => (
  <table
    className={styles.table}
    role="table"
  >
    <caption className={styles.caption}>{caption}</caption>
    <thead role="rowgroup">
      <tr
        className={styles.head}
        role="row"
      >
        <th
          className={styles.headName}
          scope="col"
          role="columnheader"
        >
          Услуга
        </th>
        <th
          className={styles.headPrice}
          scope="col"
          role="columnheader"
        >
          Цена
        </th>
      </tr>
    </thead>
    <tbody role="rowgroup">
      {prices.map((row, index) => (
        <tr
          key={row.id ?? index}
          className={styles.row}
          role="row"
        >
          <th
            className={styles.name}
            scope="row"
            role="rowheader"
          >
            {typograph(row.name)}
          </th>
          <td
            className={styles.price}
            role="cell"
          >
            {formatPrice(row.price, Boolean(row.from))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
