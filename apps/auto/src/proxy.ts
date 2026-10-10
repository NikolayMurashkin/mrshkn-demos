import { NOINDEX_ROBOTS_TAG } from '@mrshkn/demo-core/consts';
import { isIndexable } from '@mrshkn/demo-core/demo';
import { demoProxy } from '@mrshkn/demo-core/proxy';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LANG } from './consts';

/** Страницы без языка: главная и политика ведут на русскую версию всегда, без угадывания по Accept-Language. */
const UNPREFIXED = ['/', '/privacy'];

const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (!UNPREFIXED.includes(pathname)) {
    return demoProxy();
  }

  const url = request.nextUrl.clone();

  url.pathname = `/${DEFAULT_LANG}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url, 308);

  if (!isIndexable()) {
    response.headers.set('X-Robots-Tag', NOINDEX_ROBOTS_TAG);
  }

  return response;
};

export default proxy;
