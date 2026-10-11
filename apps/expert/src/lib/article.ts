import { NBSP } from '@mrshkn/demo-core/consts';
import { typograph } from '@mrshkn/demo-core/typograph';
import { MINUTE_FORMS, READING_SUFFIX, READING_WORDS_PER_MINUTE } from '../consts';
import type { LexicalNode, LexicalState, TocItem } from '../cms/types';
import { plural } from './format';

const TRANSLIT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const SECTION_FALLBACK = 'section';

/** Текст узла Lexical со всеми вложенными: заголовок из нескольких кусков с разным начертанием — одна строка. */
export const textOf = (node: LexicalNode): string =>
  node.type === 'text' ? (node.text ?? '') : (node.children ?? []).map(textOf).join('');

/** Якорь заголовка латиницей: «Что помогает сразу» → `chto-pomogaet-srazu`. */
const anchorOf = (title: string) =>
  [...title.toLowerCase()]
    .map((char) => TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || SECTION_FALLBACK;

const isSectionHeading = (node: LexicalNode) => node.type === 'heading' && node.tag === 'h2';

/**
 * Разделы статьи — H2 текста по порядку: из них оглавление, и у тех же заголовков в тексте те же `id`. Одинаковые
 * заголовки получают `-2`, `-3`: якоря на странице не повторяются.
 */
export const sectionsOf = (content: LexicalState): TocItem[] => {
  const used = new Map<string, number>();

  return content.root.children.filter(isSectionHeading).map((node) => {
    const title = textOf(node);
    const anchor = anchorOf(title);
    const count = (used.get(anchor) ?? 0) + 1;

    used.set(anchor, count);

    return { id: count > 1 ? `${anchor}-${count}` : anchor, title: typograph(title) };
  });
};

/** Текст статьи, где у каждого H2 стоит его якорь из оглавления: конвертер заголовка берет `id` из узла. */
export const withAnchors = (content: LexicalState, sections: TocItem[]): LexicalState => {
  let index = 0;

  return {
    ...content,
    root: {
      ...content.root,
      children: content.root.children.map((node) =>
        isSectionHeading(node) ? { ...node, anchor: sections[index++]?.id } : node,
      ),
    },
  };
};

const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** «N минут чтения»: слова абзацев и лида без заголовков на 180 слов в минуту, с округлением вверх. */
export const readingTime = (content: LexicalState, lead: string) => {
  const words = content.root.children
    .filter((node) => node.type !== 'heading')
    .reduce((sum, node) => sum + wordsOf(textOf(node)), wordsOf(lead));
  const minutes = Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE));

  return `${minutes}${NBSP}${plural(minutes, MINUTE_FORMS)} ${READING_SUFFIX}`;
};
