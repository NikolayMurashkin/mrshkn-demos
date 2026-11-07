import { Photo } from '@mrshkn/demo-core/components/Photo';
import { MASTER_PHOTO_FRAME, MASTER_PHOTO_VARIANTS } from '@/consts';
import { coverSizes } from '@/lib/cover';
import { photoOf } from '@/lib/photo';
import styles from './MasterPhoto.module.scss';

type MasterPhotoProps = {
  photo?: string;
  /** Ширина рамки; кадр шире 3:4 получает `sizes` по ширине отрисовки. */
  sizes: string;
  /** Портрет первого экрана страницы мастера: грузится сразу. */
  priority?: boolean;
  /** Вид плиты без кадра: капли стоят по-разному у соседних карточек. */
  variant?: number;
  className?: string;
};

/**
 * Портрет мастера 3:4 с `alt=""`: имя — в подписи рядом. Кадра нет (не задан в CMS или снят из карты) — плита
 * на градиенте токенов с каплями лака, без подписи-заглушки.
 */
export const MasterPhoto = ({ photo, sizes, priority, variant = 0, className }: MasterPhotoProps) => {
  const src = photoOf(photo);
  const frame = [styles.frame, className].filter(Boolean).join(' ');

  return src ? (
    <Photo
      src={src}
      alt=""
      sizes={coverSizes(sizes, src, MASTER_PHOTO_FRAME)}
      priority={priority}
      className={`${frame} ${styles.photo}`}
    />
  ) : (
    <span
      className={`${frame} ${styles[MASTER_PHOTO_VARIANTS[variant % MASTER_PHOTO_VARIANTS.length]]}`}
      aria-hidden="true"
    />
  );
};
