/**
 * Minimal type declaration for `safe-regex` (no upstream `.d.ts` shipped in v2).
 *
 * The library exposes a default-exported function that returns `true` when
 * the supplied regular expression is "safe" (i.e. cannot trigger catastrophic
 * backtracking under the supplied length / star-height limits).
 */

declare module 'safe-regex' {
  export interface SafeRegexOptions {
    /** Maximum pattern length accepted as "safe". */
    limit?: number;
    /** Maximum quantifier nesting depth accepted as "safe". */
    starHeight?: number;
  }

  export default function safeRegex(pattern: string | RegExp, options?: SafeRegexOptions): boolean;
}
