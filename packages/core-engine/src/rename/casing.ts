/**
 * Casing converters used by the rename engine.
 *
 * The split step treats whitespace, hyphen-minus, underscore, and lower→upper
 * boundaries as word breaks. Sequences of consecutive uppercase letters
 * (acronyms) are kept together, then split at the final uppercase before a
 * lowercase letter (so `XMLHttpRequest` → `["xml", "http", "request"]`).
 */

const ACRONYM_BOUNDARY_RE = /([A-Z]+)([A-Z][a-z])/gu;
const CAMEL_BOUNDARY_RE = /([a-z\d])([A-Z])/gu;
const LETTER_DIGIT_RE = /([A-Za-z])(\d)/gu;
// Match a digit followed by a single letter that is itself followed by a
// digit (e.g. the `4x` in `24x24`).  Replacing the match with
// `$1\u0000$2` inserts a separator between the leading digit and the
// letter without breaking subsequent passes.  We deliberately do NOT
// split digit→letter in general (so `12kv` from a base-36 index stays
// together).
const DIGIT_LETTER_DIGIT_RE = /(\d)([A-Za-z])(?=\d)/gu;
const PRELIMINARY_SPLIT_RE = /[\s\-_.]+/u;
const PLACEHOLDER = '\u0000';
const SPLITTER_RE = new RegExp(`[${PLACEHOLDER}\\s\\-_.]+`, 'u');

function splitWords(input: string): string[] {
  if (input.length === 0) {
    return [];
  }
  // Step 1: split on whitespace and existing separators.  Each segment is
  // then a single "word" we can apply the boundary rules to without the
  // non-word characters breaking our look-around logic.
  const segments = input.split(PRELIMINARY_SPLIT_RE).filter((s) => s.length > 0);
  const words: string[] = [];
  for (const segment of segments) {
    const normalised = segment
      .replace(ACRONYM_BOUNDARY_RE, `$1${PLACEHOLDER}$2`)
      .replace(DIGIT_LETTER_DIGIT_RE, `$1${PLACEHOLDER}$2`)
      .replace(CAMEL_BOUNDARY_RE, `$1${PLACEHOLDER}$2`)
      .replace(LETTER_DIGIT_RE, `$1${PLACEHOLDER}$2`);
    for (const w of normalised.split(SPLITTER_RE)) {
      if (w.length > 0) {
        words.push(w);
      }
    }
  }
  return words;
}

function joinWith(words: readonly string[], joiner: string): string {
  const lower = words.map((word) => word.toLowerCase());
  return lower.length === 0 ? '' : lower.join(joiner);
}

export function toKebab(input: string): string {
  return joinWith(splitWords(input), '-');
}

export function toSnake(input: string): string {
  return joinWith(splitWords(input), '_');
}

export function toCamel(input: string): string {
  const words = splitWords(input);
  if (words.length === 0) {
    return '';
  }
  const [first, ...rest] = words;
  const tail = rest.map((word) => `${(word[0] ?? '').toUpperCase()}${word.slice(1).toLowerCase()}`);
  return (first ?? '').toLowerCase() + tail.join('');
}

export function toPascal(input: string): string {
  return splitWords(input)
    .map((word) => `${(word[0] ?? '').toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join('');
}

export function toLower(input: string): string {
  return input.toLowerCase();
}

export function toUpper(input: string): string {
  return input.toUpperCase();
}

export function applyCasing(input: string, casing: string): string {
  switch (casing) {
    case 'none':
      return input;
    case 'kebab':
      return toKebab(input);
    case 'snake':
      return toSnake(input);
    case 'camel':
      return toCamel(input);
    case 'pascal':
      return toPascal(input);
    case 'lower':
      return toLower(input);
    case 'upper':
      return toUpper(input);
    default:
      return input;
  }
}
