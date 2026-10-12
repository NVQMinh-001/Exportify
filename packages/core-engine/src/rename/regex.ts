/**
 * Safe regex compilation and replacement.
 *
 * We delegate the star-height and length analysis to `safe-regex`, defending
 * in depth by:
 *
 *   1. Rejecting flag combinations `g + y` (safe-regex cannot statically bound
 *      them).
 *   2. Restricting the flag alphabet to `gimsu`.
 *   3. Enforcing a hard star-height ceiling of 4 and pattern length of 1024.
 *
 * On rejection we throw {@link UnsafeRegexError} so callers can surface a
 * user-friendly diagnostic instead of letting the engine enter an exponential
 * backtracking regime.
 */

import safeRegex from 'safe-regex';

import { UnsafeRegexError } from './errors.js';
import type { RegexRule } from './schema.js';

const MAX_PATTERN_LENGTH = 1024;
const MAX_STAR_HEIGHT = 4;

export function compileRegex(rule: RegexRule): RegExp {
  const { pattern } = rule;
  const requestedFlags = rule.flags ?? '';
  const wantGlobal = rule.global ?? true;

  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new UnsafeRegexError(
      pattern,
      `pattern length ${pattern.length} exceeds ${MAX_PATTERN_LENGTH}`,
    );
  }

  if (requestedFlags.includes('g') && requestedFlags.includes('y')) {
    throw new UnsafeRegexError(pattern, 'flags may not combine g and y');
  }

  if (!/^[gimsu]*$/u.test(requestedFlags)) {
    throw new UnsafeRegexError(pattern, `unsupported flags: "${requestedFlags}"`);
  }

  const isSafe = safeRegex(rule.pattern, { limit: 1000, starHeight: MAX_STAR_HEIGHT });
  if (!isSafe) {
    throw new UnsafeRegexError(
      pattern,
      `fails safe-regex star-height (max ${MAX_STAR_HEIGHT}) / length (max ${MAX_PATTERN_LENGTH}) analysis`,
    );
  }

  const finalFlags = wantGlobal
    ? requestedFlags.includes('g')
      ? requestedFlags
      : `${requestedFlags}g`
    : requestedFlags.replace(/g/gu, '');

  return new RegExp(pattern, finalFlags);
}

export function safeReplace(input: string, regex: RegExp, replacement: string): string {
  return input.replace(regex, replacement);
}
