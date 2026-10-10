import localFont from 'next/font/local';

/**
 * Гарнитуры направления — Sofia Sans трех ширин, локальные сабсеты (латиница, кириллица, знаки): сборке не нужна
 * сеть к Google. Семейства названы, как в токенах; переменные классов не используются, классы на `<html>`
 * подключают шрифты к странице. Знака ₽ в Sofia Sans нет — его рисует запасной шрифт.
 */
export const sofiaSans = localFont({
  src: './fonts/sofia-sans.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-sofia-sans',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Sofia Sans' }],
});

export const sofiaSansSemiCondensed = localFont({
  src: './fonts/sofia-sans-semi-condensed.woff2',
  weight: '500 700',
  display: 'swap',
  variable: '--font-sofia-sans-semi-condensed',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Sofia Sans Semi Condensed' }],
});

export const sofiaSansExtraCondensed = localFont({
  src: './fonts/sofia-sans-extra-condensed.woff2',
  weight: '800',
  display: 'swap',
  variable: '--font-sofia-sans-extra-condensed',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Sofia Sans Extra Condensed' }],
});
