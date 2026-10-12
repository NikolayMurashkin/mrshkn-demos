import type { Metadata } from 'next';
import { Poster } from '@/components/Poster';
import { PrintButton } from '@/components/PrintButton';
import { POSTER } from '@/consts';
import { menuQrUrl, qrSvg } from '@/lib/qr';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Плакат с QR-кодом меню',
  description: 'Плакат A4 для кассы: QR-код открывает меню кофейни на телефоне.',
};

const PosterPage = async () => {
  const url = menuQrUrl();

  return (
    <main className={styles.page}>
      <div className={styles.hint}>
        <p className={styles.hintText}>{POSTER.hint}</p>
        <PrintButton />
      </div>
      <Poster
        url={url}
        qrSvg={await qrSvg(url)}
      />
    </main>
  );
};

export default PosterPage;
