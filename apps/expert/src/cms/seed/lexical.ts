import type { LexicalNode, LexicalState, SeedArticleSection } from '../types';

const text = (value: string): LexicalNode => ({
  type: 'text',
  text: value,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
});

const block = (node: LexicalNode): LexicalNode => ({
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  ...node,
});

/** Текст статьи засева — состояние редактора Lexical: H2 раздела и его абзацы, как их сохранила бы админка. */
export const lexicalFromSections = (sections: SeedArticleSection[]): LexicalState => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: sections.flatMap(({ title, paragraphs }) => [
      block({ type: 'heading', tag: 'h2', children: [text(title)] }),
      ...paragraphs.map((paragraph) =>
        block({ type: 'paragraph', textFormat: 0, textStyle: '', children: [text(paragraph)] }),
      ),
    ]),
  },
});
