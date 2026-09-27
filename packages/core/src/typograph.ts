import { NBSP, SHORT_WORDS } from './consts';

const shortWord = new RegExp(`(?<=^|[\\s(«„"—-])(${SHORT_WORDS.join('|')}) `, 'giu');

/**
 * Типограф текстов из CMS: после коротких предлогов, союзов и частиц и перед тире — неразрывный пробел, чтобы
 * «в», «и», «на» не висели в конце строки, а тире не начинало ее. В базе тексты хранятся без него.
 */
export const typograph = (text: string) => text.replace(shortWord, `$1${NBSP}`).replace(/ —/g, `${NBSP}—`);

/** Абзацы текстового поля CMS: разделяются пустой строкой. */
export const paragraphs = (text: string | null | undefined) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(typograph);
