import localFont from 'next/font/local';

/**
 * Гарнитуры направления «Неон» — локальные сабсеты из DS (кириллица, латиница, цифры): сборке не нужна сеть.
 * Знака ₽ в Dela Gothic One нет — стек дисплея в токенах берет его из Commissioner. Запасное начертание с метриками
 * Next собирает сам по файлу (`adjustFontFallback`) только у Commissioner: запасной Arial у дисплея встал бы в стеке
 * раньше Commissioner и отдал бы свой ₽. Имя семейства — тоже от Next, поэтому токены берут стек
 * из переменных `variable`, а не из названия гарнитуры. Классы `variable` обеих гарнитур стоят на `<html>`.
 */
export const delaGothicOne = localFont({
  src: './fonts/dela-gothic-one.woff2',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-face-dela-gothic-one',
});

export const commissioner = localFont({
  src: './fonts/commissioner.woff2',
  weight: '400 700',
  display: 'swap',
  adjustFontFallback: 'Arial',
  variable: '--font-face-commissioner',
});
