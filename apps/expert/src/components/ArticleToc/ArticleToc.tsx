'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/cms/types';
import { ARTICLES_PAGE, TOC_READING_LINE } from '@/consts';
import styles from './ArticleToc.module.scss';

type ArticleTocProps = {
  sections: TocItem[];
};

/** Оглавление статьи из H2: пункты ведут на якоря, текущий раздел по прокрутке — заливка `ink` и `aria-current`. */
export const ArticleToc = ({ sections }: ArticleTocProps) => {
  const [current, setCurrent] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const headings = sections.flatMap(({ id }) => document.getElementById(id) ?? []);

    if (!headings.length) {
      return undefined;
    }

    const update = () => {
      const line = window.innerHeight * TOC_READING_LINE;
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= line);

      setCurrent((passed.at(-1) ?? headings[0]).id);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sections]);

  return (
    <nav
      className={styles.toc}
      aria-labelledby="toc-title"
    >
      <p
        className={styles.title}
        id="toc-title"
      >
        {ARTICLES_PAGE.toc}
      </p>
      <ol className={styles.list}>
        {sections.map(({ id, title }) => (
          <li key={id}>
            <a
              className={styles.link}
              href={`#${id}`}
              aria-current={id === current ? 'true' : undefined}
            >
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
