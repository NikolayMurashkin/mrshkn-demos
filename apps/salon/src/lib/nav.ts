/** Текущий пункт меню: «Главная» — только на `/`, раздел — и на своих вложенных страницах (мастер → «Мастера»). */
export const isCurrentNav = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
