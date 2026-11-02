import { Photo } from '@mrshkn/demo-core/components/Photo';
import { PHOTOS } from '@/assets/photos';
import { EXPERT, PORTRAIT_SIZES } from '@/consts';
import styles from './Portrait.module.scss';

/** Портрет на полях головки «Обо мне» — кадр первого экрана. Имя и роль — в подписи, поэтому у кадра пустой alt. */
export const Portrait = () => (
  <figure className={styles.portrait}>
    <Photo
      src={PHOTOS.portrait}
      alt=""
      sizes={PORTRAIT_SIZES}
      priority
      className={styles.photo}
    />
    <figcaption className={styles.caption}>
      {EXPERT.name}, {EXPERT.role}
    </figcaption>
  </figure>
);
