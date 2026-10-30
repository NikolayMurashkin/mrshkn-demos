import { BRAND } from '../../consts';
import { LOGO_HEIGHT, LOGO_SHAPES, LOGO_VIEW_BOX, LOGO_WIDTH } from './consts';
import styles from './Logo.module.scss';

type LogoProps = {
  className?: string;
};

/** Горизонтальный знак кофейни: чашка и надпись «Гуща» с подписью «кофейня», цвета — токены Pop. */
export const Logo = ({ className }: LogoProps) => (
  <svg
    className={className ? `${styles.logo} notranslate ${className}` : `${styles.logo} notranslate`}
    width={LOGO_WIDTH}
    height={LOGO_HEIGHT}
    viewBox={LOGO_VIEW_BOX}
    role="img"
    aria-label={`${BRAND.name} — ${BRAND.kind}`}
  >
    {LOGO_SHAPES.map(({ id, d, fill, stroke, strokeWidth }) => (
      <path
        key={id}
        className={stroke ? `${styles[fill]} ${styles[`${stroke}Line`]}` : styles[fill]}
        d={d}
        strokeWidth={strokeWidth}
      />
    ))}
  </svg>
);
