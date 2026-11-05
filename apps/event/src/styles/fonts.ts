import localFont from 'next/font/local';

/**
 * Гарнитуры направления Kinetic — локальные сабсеты из DS (кириллица, латиница, цифры, ₽): сборке не нужна сеть.
 * Семейства названы «Unbounded» и «Golos Text», как в токенах; запасные начертания с метриками — в `globals.scss`.
 * Классы `variable` обеих гарнитур стоят на `<html>`: так страница грузит оба файла, а стек шрифтов берется из токенов.
 */
export const unbounded = localFont({
  src: './fonts/unbounded.woff2',
  weight: '700 900',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Unbounded' }],
  variable: '--font-face-unbounded',
});

export const golosText = localFont({
  src: './fonts/golos-text.woff2',
  weight: '400 600',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Golos Text' }],
  variable: '--font-face-golos-text',
});
