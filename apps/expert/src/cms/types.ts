export type SeedFormat = {
  slug: string;
  title: string;
  /** Минут. */
  duration: number;
  place: string;
  /** Целые рубли. */
  price: number;
  summary: string;
};

export type SeedArticleSection = {
  title: string;
  paragraphs: string[];
};

export type SeedArticle = {
  slug: string;
  title: string;
  /** ISO-дата публикации. */
  publishedAt: string;
  lead: string;
  sections: SeedArticleSection[];
  /** Ключ кадра из `src/assets/photos/index.ts`; нет — без фото. */
  photo?: string;
};

/** Узел Lexical в том виде, в каком его хранит поле richText: страницам нужны тип, тег заголовка и текст. */
export type LexicalNode = {
  type: string;
  tag?: string;
  text?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

export type LexicalState = {
  root: LexicalNode & { children: LexicalNode[] };
};

export type TocItem = {
  id: string;
  title: string;
};
