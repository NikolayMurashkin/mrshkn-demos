import { NextResponse } from 'next/server';
import { NOINDEX_ROBOTS_TAG } from './consts';
import { isIndexable } from './demo';

/** Вне production каждый ответ демо — страницы, API, админка — закрыт от индексации заголовком. */
export const demoProxy = () => {
  const response = NextResponse.next();

  if (!isIndexable()) {
    response.headers.set('X-Robots-Tag', NOINDEX_ROBOTS_TAG);
  }

  return response;
};

export const demoRobots = () =>
  isIndexable() ? { rules: { userAgent: '*', allow: '/' } } : { rules: { userAgent: '*', disallow: '/' } };
