import { typograph } from '@mrshkn/demo-core/typograph';
import { MasterPhoto } from '@/components/MasterPhoto';
import { MASTER_CARD_PHOTO_SIZES, MASTERS_HREF } from '@/consts';
import { formatYears } from '@/lib/format';
import type { Master } from '@/types';
import styles from './MasterCards.module.scss';

type MasterCardsProps = {
  masters: Master[];
  /** Уровень имени: на главной — h3 под заголовком секции, на `/masters` — h2 под H1 страницы. */
  nameTag?: 'h2' | 'h3';
  /** Сетка — первый экран страницы (`/masters`): портрет первой карточки — кадр LCP, грузится сразу. */
  priorityFirst?: boolean;
};

/** Карточки мастеров: портрет, имя — ссылка на страницу мастера, растянутая на карточку, специализация и стаж. */
export const MasterCards = ({ masters, nameTag: Name = 'h3', priorityFirst = false }: MasterCardsProps) => (
  <ul className={styles.cards}>
    {masters.map(({ slug, name, role, years, photo }, index) => (
      <li
        key={slug}
        className={styles.card}
      >
        <MasterPhoto
          photo={photo}
          sizes={MASTER_CARD_PHOTO_SIZES}
          priority={priorityFirst && index === 0}
          variant={index}
          className={styles.photo}
        />
        <div className={styles.body}>
          <Name className={styles.name}>
            <a href={`${MASTERS_HREF}/${slug}`}>{name}</a>
          </Name>
          <p className={styles.role}>{typograph(role)}</p>
          <p className={styles.years}>{formatYears(years)}</p>
        </div>
      </li>
    ))}
  </ul>
);
