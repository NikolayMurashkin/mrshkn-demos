import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteMetadata } from '@/lib/metadata';
import { rubik } from '@/styles/fonts';
import '@/styles/globals.scss';

type PrintLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = siteMetadata;

/** Плакат печатается на A4 целиком: без шапки, плиты и подвала сайта — поэтому свой корневой layout. */
const PrintLayout = ({ children }: PrintLayoutProps) => (
  <html
    lang="ru"
    className={rubik.className}
  >
    <body>{children}</body>
  </html>
);

export default PrintLayout;
