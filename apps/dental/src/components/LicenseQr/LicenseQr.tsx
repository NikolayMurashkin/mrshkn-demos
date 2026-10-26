import { INFO, LICENSE } from '@/consts';
import { ArrowOut } from '../ArrowOut';
import styles from './LicenseQr.module.scss';

type LicenseQrProps = {
  /** Разметка QR-кода адреса реестра — `qrSvg(LICENSE.registryUrl)`. */
  svg: string;
};

/**
 * QR-код реестра лицензий с подписью и текстовой ссылкой туда же: код не прочитать глазами, ссылку — можно.
 * Со скрытыми картинками версии для слабовидящих вместо кода — подпись.
 */
export const LicenseQr = ({ svg }: LicenseQrProps) => (
  <div className={styles.qr}>
    <figure className={styles.figure}>
      <div
        className={styles.code}
        data-lv-image
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p
        className={styles.hidden}
        data-lv-image-alt
      >
        {INFO.qrHidden}
      </p>
      <figcaption className={styles.caption}>{INFO.qrCaption}</figcaption>
    </figure>
    <a
      className={styles.link}
      href={LICENSE.registryUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {INFO.registryLink}
      <ArrowOut />
    </a>
  </div>
);
