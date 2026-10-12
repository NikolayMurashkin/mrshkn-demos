import content from './content.json';
import { typographContent } from './lib/typograph-content';
import type { DocPage, Feature, LinkItem, LogLine, NavItem, Plan, Release } from './types';

/**
 * Тексты демо — статикой в `content.json`: их же читает генератор DS Terminal (раздел «Многостраничный сайт»),
 * чтобы превью и демо не расходились. Продукт вымышлен, тарифы и релизы — тоже.
 */
const CONTENT = typographContent(content);

export const PRODUCT = CONTENT.product;

export const NAV: NavItem[] = CONTENT.nav;

export const NAV_LABEL = CONTENT.navLabel;

export const HEADER_CTA: LinkItem = CONTENT.cta;

export const HERO = {
  ...CONTENT.hero,
  primary: CONTENT.hero.primary satisfies LinkItem,
  secondary: CONTENT.hero.secondary satisfies LinkItem,
  log: CONTENT.hero.log as LogLine[],
};

/** Ширина колонки процента в логе: «  1%» и « 25%» встают под одну правую границу. */
export const STAGE_WIDTH = 4;

export const FEATURES = {
  ...CONTENT.features,
  items: CONTENT.features.items satisfies Feature[],
};

export const PRICING = {
  ...CONTENT.pricing,
  plans: CONTENT.pricing.plans satisfies Plan[],
};

export const CHANGELOG = {
  ...CONTENT.changelog,
  releases: CONTENT.changelog.releases satisfies Release[],
};

export const FOOTER_CTA = CONTENT.footer;

export const DOCS = {
  label: CONTENT.docs.label,
  navTitle: CONTENT.docs.navTitle,
  pagerTitle: CONTENT.docs.pagerTitle,
  prev: CONTENT.docs.prev,
  next: CONTENT.docs.next,
};

export const DOC_PAGES: DocPage[] = CONTENT.docs.pages;

export const PRIVACY_PAGE = CONTENT.privacy;

/** Цвет полосы браузера — фон страницы своей темы (`--bg` в `tokens.scss`). */
export const THEME_COLORS = {
  dark: '#0f151c',
  light: '#f5f7f9',
};
