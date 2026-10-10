import type { DemoLang } from '@mrshkn/demo-core/types';
import type { ReactNode } from 'react';
import type { AutoNode } from '../../cms/types';
import { EXPLAINERS } from '../../consts';
import { formatPrice, termText, typeset } from '../../lib/lang';
import { TEXTS } from '../../texts';
import styles from './NodeCard.module.scss';

type NodeCardProps = {
  node: AutoNode;
  lang: DemoLang;
  headingLevel?: 'h2' | 'h3';
  titleId?: string;
  /** Кнопка рядом с заголовком: закрыть карточку на первом экране. */
  action?: ReactNode;
  /** Под заголовком: симптом, которым открыли карточку. */
  lead?: ReactNode;
  /** После заказ-наряда: примечание о цене и запись. */
  children?: ReactNode;
};

/** Карточка узла — заказ-наряд: вероятные причины, цена работы «от» и срок. Тексты из CMS — через типограф. */
export const NodeCard = ({ node, lang, headingLevel = 'h3', titleId, action, lead, children }: NodeCardProps) => {
  const texts = TEXTS[lang].card;
  const Heading = headingLevel;
  const explainer = EXPLAINERS[node.key];

  return (
    <article
      className={styles.card}
      aria-labelledby={titleId}
    >
      <div className={styles.head}>
        <Heading
          className={styles.title}
          id={titleId}
        >
          {typeset(node.name, lang)}
        </Heading>
        {action}
      </div>
      {lead}
      {explainer && (
        <div
          className={styles.explainer}
          data-explainer={explainer}
        />
      )}
      <table className={styles.order}>
        <caption className={styles.caption}>{texts.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{texts.colCause}</th>
            <th scope="col">{texts.colPrice}</th>
            <th scope="col">{texts.colTerm}</th>
          </tr>
        </thead>
        <tbody>
          {node.causes.map((cause) => (
            <tr key={`${cause.text}-${cause.price}`}>
              <td>{typeset(cause.text, lang)}</td>
              <td>{formatPrice(cause.price, lang)}</td>
              <td>{termText(cause.term, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </article>
  );
};
