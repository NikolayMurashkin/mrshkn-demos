import localFont from 'next/font/local';

/**
 * Гарнитуры направления Editorial — локальные сабсеты из DS (кириллица, латиница, ₽): сборке не нужна сеть к Google.
 * Семейства названы «Prata» и «Onest», как в токенах; запасные начертания с метриками — в `globals.scss`. Классы `variable` обеих
 * гарнитур стоят на `<html>`: так страница грузит оба файла, а стек шрифтов берется из токенов.
 */
export const prata = localFont({
  src: './fonts/prata.woff2',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Prata' }],
  variable: '--font-face-prata',
});

export const onest = localFont({
  src: './fonts/onest.woff2',
  weight: '400 600',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Onest' }],
  variable: '--font-face-onest',
});
