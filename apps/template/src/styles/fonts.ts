import localFont from 'next/font/local';

/**
 * Гарнитура направления Swiss — локальный сабсет из DS (300–800, кириллица, латиница, ₽): сборке не нужна сеть
 * к Google. Семейство названо «Geologica», как в токенах; запасное начертание с метриками — в `globals.scss`.
 */
export const geologica = localFont({
  src: './fonts/geologica.woff2',
  weight: '300 800',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Geologica' }],
});
