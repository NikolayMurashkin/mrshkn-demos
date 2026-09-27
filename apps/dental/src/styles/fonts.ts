import { Geologica } from 'next/font/google';

/** Гарнитура направления Swiss. latin-ext нужен ради знака рубля: в кириллице и латинице Google его нет. */
export const geologica = Geologica({
  subsets: ['cyrillic', 'latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-geologica',
});
