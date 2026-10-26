import Link from 'next/link';
import { Fragment } from 'react';
import { NumberText } from '../NumberText';
import type { RuleLink } from './types';
import styles from './RuleList.module.scss';

type RuleListProps = {
  rules: string[];
  /** Слово в кавычках-елочках, которое в пункте становится ссылкой: «Цены» → страница цен. */
  link?: RuleLink;
};

const withLink = (rule: string, link?: RuleLink) => {
  const quoted = link ? `«${link.text}»` : '';
  const parts = quoted ? rule.split(quoted) : [rule];

  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 && link && (
        <>
          «
          <Link
            className={styles.link}
            href={link.href}
            prefetch={false}
          >
            {link.text}
          </Link>
          »
        </>
      )}
      <NumberText text={part} />
    </Fragment>
  ));
};

/** Правила клиники пунктами по порядку: запись на первый прием, платные услуги. */
export const RuleList = ({ rules, link }: RuleListProps) => (
  <ol className={styles.list}>
    {rules.map((rule) => (
      <li
        key={rule}
        className={styles.item}
      >
        <span className={styles.text}>{withLink(rule, link)}</span>
      </li>
    ))}
  </ol>
);
