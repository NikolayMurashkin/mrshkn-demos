import { getImageProps, type StaticImageData } from 'next/image';
import styles from './Photo.module.scss';

type PhotoProps = {
  /** Статический импорт файла из `src/assets` приложения. */
  src: StaticImageData;
  /** Пустая строка — декоративный кадр: подписи для режима «без картинок» нет. */
  alt: string;
  /** Ширина кадра в раскладке вызывающего: по ней браузер выбирает файл из `srcset`. */
  sizes: string;
  /** Кадр первого экрана: грузится сразу и с высоким приоритетом. */
  priority?: boolean;
  /** Размеры и кадрирование задает вызывающий. */
  className?: string;
};

/**
 * Кадр демо. Формат (AVIF или WebP) оптимизатор Next выбирает по заголовку Accept браузера — у демо в `next.config.ts`
 * `images.formats`. В версии для слабовидящих «без картинок» кадр скрыт, вместо него — текст `alt`.
 */
export const Photo = ({ src, alt, sizes, priority = false, className }: PhotoProps) => {
  const { props } = getImageProps({
    src,
    alt,
    sizes,
    ...(priority ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy' }),
  });

  return (
    <>
      <picture className={className ? `${styles.picture} ${className}` : styles.picture}>
        <img
          {...props}
          alt={alt}
          className={styles.image}
        />
      </picture>
      {alt ? (
        <span
          className={styles.alt}
          data-lv-image-alt
        >
          {alt}
        </span>
      ) : null}
    </>
  );
};
