/**
 * Filename sanitization: NFC normalisation, control-character strip,
 * whitespace collapse, Windows-reserved-character strip, and an optional
 * transliteration hook.
 *
 * The hot path is intentionally allocation-light — each rule produces a single
 * intermediate string only when a match is found.
 */

import { RenameError } from './errors.js';
import { resolveSanitizeOptions, type ResolvedSanitizeOptions } from './schema.js';

// ASCII C0 + C1 controls, plus DEL.  Whitespace control codes are handled by
// the collapse step so we deliberately exclude \t, \n, \r, \f, \v.
const CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/gu; // eslint-disable-line no-control-regex
const WHITESPACE_RE = /\s+/gu;
const RESERVED_RE = /[<>:"/\\|?*]/gu;

export function sanitize(input: string, options?: Partial<ResolvedSanitizeOptions>): string {
  const resolved = resolveSanitizeOptions(options);
  const {
    nfc,
    stripControlChars,
    stripReserved,
    collapseWhitespace,
    transliterate,
    replacement,
    transliterationTable,
  } = resolved;

  let output = input;

  if (stripReserved) {
    output = output.replace(RESERVED_RE, replacement);
  }

  if (stripControlChars) {
    output = output.replace(CONTROL_RE, replacement);
  }

  if (collapseWhitespace) {
    output = output.replace(WHITESPACE_RE, ' ');
  }

  if (nfc && typeof output.normalize === 'function') {
    output = output.normalize('NFC');
  }

  if (transliterate) {
    if (!transliterationTable) {
      throw new RenameError('sanitize(): transliterate=true requires a transliterationTable');
    }
    let transliterated = '';
    for (const ch of output) {
      const mapped = transliterationTable[ch];
      transliterated += mapped ?? ch;
    }
    output = transliterated;
  }

  return output;
}
