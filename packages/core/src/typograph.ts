import { NBHY, NBSP, SHORT_HYPHEN_PART, SHORT_WORDS } from './consts';

const shortWord = new RegExp(`(?<=^|[\\s(«„"—\\-${NBHY}])(${SHORT_WORDS.join('|')}) `, 'giu');

const shortPart = `\\p{L}{1,${SHORT_HYPHEN_PART}}`;

const shortHyphen = new RegExp(`(?<=(?<!\\p{L})${shortPart})-(?=\\p{L})|(?<=\\p{L})-(?=${shortPart}(?!\\p{L}))`, 'gu');

const initial = / (?=\p{Lu}\.(?!\p{L}))/gu;

/**
 * Типограф текстов из CMS: после коротких предлогов, союзов и частиц, перед тире и перед инициалом — неразрывный
 * пробел, чтобы «в», «и», «на» не висели в конце строки, тире не начинало ее, а «К.» не отрывалось от имени. Дефис
 * рядом с частью слова не длиннее трех букв — неразрывный: «из-за», «кто-то» не рвутся переносом. В базе тексты
 * хранятся без этих знаков.
 */
export const typograph = (text: string) =>
  text.replace(shortHyphen, NBHY).replace(shortWord, `$1${NBSP}`).replace(/ —/g, `${NBSP}—`).replace(initial, NBSP);

/** Абзацы текстового поля CMS: разделяются пустой строкой. */
export const paragraphs = (text: string | null | undefined) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(typograph);
