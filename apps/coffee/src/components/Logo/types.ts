/** Цвет детали знака — токен демо: `ink`, `accent-alt` (желтый), `surface` (белый). */
export type LogoColor = 'ink' | 'alt' | 'surface';

/** Цвет обводки детали знака — только токены, для которых есть класс обводки. */
export type LogoStroke = 'ink' | 'alt';

export type LogoShape = {
  id: string;
  d: string;
  fill: LogoColor;
  stroke?: LogoStroke;
  strokeWidth?: number;
};
