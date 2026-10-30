import { POSTER } from '../../consts';
import { DEMO } from '../../demo.config';
import { Star } from '../Star';
import { Logo } from '../Logo';
import styles from './Poster.module.scss';

type PosterProps = {
  url: string;
  /** SVG QR-кода, готовый на сервере: модули — цвет текста стикера. */
  qrSvg: string;
};

/** Лист A4 у кассы: QR-код ведет на компактное меню, адрес под кодом — на случай, если камера код не берет. */
export const Poster = ({ url, qrSvg }: PosterProps) => (
  <article className={styles.poster}>
    <div className={styles.sheet}>
      <Logo className={styles.logo} />
      <h1 className={styles.title}>{POSTER.title}</h1>
      <div
        className={styles.qr}
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p
        className={styles.url}
        translate="no"
      >
        {url.replace(/^https?:\/\//, '')}
      </p>
      <p className={styles.address}>
        {[DEMO.business.name, DEMO.business.address?.streetAddress].filter(Boolean).join(', ')}
      </p>
      <p className={styles.demo}>{POSTER.demo}</p>
      <Star className={styles.star} />
    </div>
  </article>
);
