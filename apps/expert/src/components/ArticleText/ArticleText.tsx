import { typograph } from '@mrshkn/demo-core/typograph';
import type { SerializedHeadingNode, SerializedLinkNode, SerializedTextNode } from '@payloadcms/richtext-lexical';
import { type JSXConvertersFunction, LinkJSXConverter, RichText } from '@payloadcms/richtext-lexical/react';
import type { LexicalState } from '@/cms/types';
import styles from './ArticleText.module.scss';

type ArticleTextProps = {
  content: LexicalState;
};

/** Внутренняя ссылка текста — на другую статью: связанный документ приходит с `depth: 1`. */
const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc?.value;

  return typeof doc === 'object' && doc && 'slug' in doc ? `/articles/${String(doc.slug)}` : '/articles';
};

/**
 * Тексты из CMS идут через типограф: в базе неразрывных пробелов нет. H2 получает якорь из оглавления
 * (`withAnchors`), остальное — стандартные конвертеры Payload.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  text: (args) => {
    const node = args.node as SerializedTextNode;
    const convert = defaultConverters.text;

    return typeof convert === 'function' ? convert({ ...args, node: { ...node, text: typograph(node.text) } }) : null;
  },
  heading: ({ node, nodesToJSX }) => {
    const { tag, children, anchor } = node as SerializedHeadingNode & { anchor?: string };
    const Tag = tag === 'h2' ? 'h2' : 'h3';

    return <Tag id={anchor}>{nodesToJSX({ nodes: children })}</Tag>;
  },
});

/** Текст статьи (`.e-prose`): колонка до 66 знаков, первый абзац с буквицей, H2 Prata с якорями. */
export const ArticleText = ({ content }: ArticleTextProps) => (
  <RichText
    className={styles.prose}
    converters={converters}
    data={content as never}
  />
);
