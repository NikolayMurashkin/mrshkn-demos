import localFont from 'next/font/local';

/**
 * Гарнитуры направления Terminal — локальные сабсеты из DS (кириллица, латиница, ₽, стрелки): сборке не нужна сеть.
 * Семейства названы «JetBrains Mono» и «Terminal Sans», как в токенах; запасные начертания с метриками — в
 * `globals.scss`. Классы `variable` обеих гарнитур стоят на `<html>`: так страница грузит оба файла, а стек шрифтов
 * берется из токенов.
 */
export const jetbrainsMono = localFont({
  src: './fonts/jetbrains-mono.woff2',
  weight: '400 700',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'JetBrains Mono' }],
  variable: '--font-face-jetbrains-mono',
});

export const terminalSans = localFont({
  src: './fonts/terminal-sans.woff2',
  weight: '400 700',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'Terminal Sans' }],
  variable: '--font-face-terminal-sans',
});
