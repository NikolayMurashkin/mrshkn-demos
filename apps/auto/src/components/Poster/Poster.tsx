import { getImageProps } from 'next/image';
import posterNarrow from '../../assets/poster-390x844.png';
import posterWide from '../../assets/poster-1440x900.png';
import { POSTER_NARROW_MEDIA } from '../../consts';
import styles from './Poster.module.scss';

type PosterProps = {
  alt: string;
};

/**
 * Первый кадр сцены — постер из Blender: на телефоне узкий, на остальных ширинах широкий. Это элемент LCP, поэтому
 * без ленивой загрузки и с высоким приоритетом. Зерна и виньетки в постере нет: их накладывает сцена.
 */
export const Poster = ({ alt }: PosterProps) => {
  const common = { alt, sizes: '100vw', fetchPriority: 'high' as const, loading: 'eager' as const };
  const {
    props: { srcSet: narrow },
  } = getImageProps({ ...common, src: posterNarrow });
  const { props: wide } = getImageProps({ ...common, src: posterWide });

  return (
    <picture className={styles.poster}>
      <source
        media={POSTER_NARROW_MEDIA}
        srcSet={narrow}
      />
      <img
        {...wide}
        alt={alt}
        className={styles.image}
      />
    </picture>
  );
};
