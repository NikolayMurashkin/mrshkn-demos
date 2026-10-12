import { DOC_PAGES } from '../consts';

export const docHref = (slug: string) => `/docs/${slug}`;

export const findDocPage = (slug: string) => DOC_PAGES.find((page) => page.slug === slug);

/** Соседние разделы документации по порядку чтения: у первого нет предыдущего, у последнего — следующего. */
export const docNeighbours = (slug: string) => {
  const index = DOC_PAGES.findIndex((page) => page.slug === slug);

  return {
    prev: index > 0 ? DOC_PAGES[index - 1] : undefined,
    next: index >= 0 && index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : undefined,
  };
};
