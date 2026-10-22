import localFont from 'next/font/local';

/**
 * Гарнитура направления Pop — локальный сабсет Rubik из DS (500–900, кириллица, латиница, ₽): сборке не нужна сеть
 * к Google. Семейство названо «Rubik», как в токенах; запасное начертание с метриками — в `globals.scss`.
 */
export const rubik = localFont({
  src: './fonts/rubik.woff2',
  weight: '500 900',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Rubik' }],
});
