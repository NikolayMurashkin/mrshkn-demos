import type { NavItem } from '../types';

/** Текущий пункт — раздел, в котором открыта страница; якоря главной текущими не бывают. */
export const isCurrent = (pathname: string, { section }: NavItem) =>
  Boolean(section) && (pathname === section || pathname.startsWith(`${section}/`));
