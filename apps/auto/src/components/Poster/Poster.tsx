import { getImageProps } from 'next/image';
import posterColumn from '../../assets/poster-1360x1800.png';
import posterWide from '../../assets/poster-1440x900.png';
import posterPhone from '../../assets/poster-585x656.png';
import { POSTER_NARROW_MEDIA, STACKED_MEDIA, STAGE_CANVAS } from '../../consts';
import { coverSizes } from '../../lib/poster';
import styles from './Poster.module.scss';

type PosterProps = {
  alt: string;
};

/**
 * Первый кадр сцены — постер из Blender, три файла под холст сцены, а не под окно: на телефоне — под холст телефона,
 * в раскладке в колонку — широкий, на широком окне — под среднюю колонку. `sizes` у каждого файла — ширина его рисунка
 * в холсте. Это элемент LCP, поэтому без ленивой загрузки и с высоким приоритетом. Зерна и виньетки в постере нет:
 * их накладывает сцена.
 */
export const Poster = ({ alt }: PosterProps) => {
  const common = { alt, fetchPriority: 'high' as const, loading: 'eager' as const };
  const phoneSizes = coverSizes(STAGE_CANVAS.stacked, posterPhone);
  const wideSizes = coverSizes(STAGE_CANVAS.stacked, posterWide);
  const {
    props: { srcSet: phone },
  } = getImageProps({ ...common, src: posterPhone, sizes: phoneSizes });
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: posterWide, sizes: wideSizes });
  const { props: column } = getImageProps({
    ...common,
    src: posterColumn,
    sizes: coverSizes(STAGE_CANVAS.column, posterColumn),
  });

  return (
    <picture className={styles.poster}>
      <source
        media={POSTER_NARROW_MEDIA}
        srcSet={phone}
        sizes={phoneSizes}
      />
      <source
        media={STACKED_MEDIA}
        srcSet={wide}
        sizes={wideSizes}
      />
      <img
        {...column}
        alt={alt}
        className={styles.image}
      />
    </picture>
  );
};
