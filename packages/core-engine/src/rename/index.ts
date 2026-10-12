/**
 * Public surface of the rename engine.
 *
 * Exports the type-level contract from `./schema.js` and the runtime entry
 * points `rename` / `renameBatch` / `compileRegex` / `validatePattern`.
 *
 * The engine is intentionally pure: every function is deterministic for a
 * given `(asset, pattern)` pair, so callers can rely on stable outputs even
 * across processes.
 */

import { sanitize } from './sanitize.js';
import { compileRegex, safeReplace } from './regex.js';
import { applyTemplate } from './placeholders.js';
import { validatePattern, resolvePattern, resolveSanitizeOptions } from './schema.js';
import { applyCasing } from './casing.js';
import type { Asset, RenamePattern, RenameResult } from './schema.js';

export type {
  Asset,
  Casing,
  RegexRule,
  RenamePattern,
  RenameResult,
  SanitizeOptions,
  ResolvedRenamePattern,
  ResolvedSanitizeOptions,
} from './schema.js';
export {
  AssetSchema,
  CasingSchema,
  RenamePatternSchema,
  RenameResultSchema,
  RegexRuleSchema,
  SanitizeOptionsSchema,
  resolvePattern,
  resolveSanitizeOptions,
  validatePattern,
} from './schema.js';
export { compileRegex, safeReplace } from './regex.js';
export {
  InvalidPatternError,
  InvalidTemplateError,
  RenameError,
  UnsafeRegexError,
} from './errors.js';
export { applyCasing, toCamel, toKebab, toLower, toPascal, toSnake, toUpper } from './casing.js';
export { sanitize } from './sanitize.js';
export { applyTemplate } from './placeholders.js';

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

function buildSanitizeOptions(
  sanitize: RenamePattern['sanitize'],
): ReturnType<typeof resolveSanitizeOptions> | undefined {
  if (sanitize === false || sanitize === undefined) {
    return undefined;
  }
  if (sanitize === true) {
    return resolveSanitizeOptions(undefined);
  }
  return resolveSanitizeOptions(sanitize);
}

// -----------------------------------------------------------------------------
// Single-asset pipeline (internal — caller must pass a parsed pattern).
// -----------------------------------------------------------------------------

function renameInternal(asset: Asset, parsed: RenamePattern): RenameResult {
  // Resolve defaults so we have a fully-populated pattern for the hot path.
  const pattern = resolvePattern(parsed);
  const operations: string[] = [];

  const original = `${asset.name}.${asset.extension}`;
  const ext = pattern.replaceExtension ?? asset.extension;

  // 1. Sanitize (optional)
  let name = asset.name;
  const sanitizeOpts = buildSanitizeOptions(pattern.sanitize);
  if (sanitizeOpts) {
    name = sanitize(name, sanitizeOpts);
    operations.push('sanitize');
  }

  // 2. Casing
  if (pattern.casing !== 'none') {
    name = applyCasing(name, pattern.casing);
    operations.push('casing');
  }

  // 3. Regex (optional)
  if (pattern.regex) {
    const re = compileRegex(pattern.regex);
    name = safeReplace(name, re, pattern.regex.replacement);
    operations.push('regex');
  }

  // 4. Template (always runs — default '{name}')
  const templated = applyTemplate(
    pattern.template,
    {
      name,
      ext,
      index: asset.index,
      ...(asset.width !== undefined ? { width: asset.width } : {}),
      ...(asset.height !== undefined ? { height: asset.height } : {}),
      ...(asset.format !== undefined ? { format: asset.format } : {}),
      ...(asset.createdAt !== undefined ? { createdAt: asset.createdAt } : {}),
    },
    {
      indexPadding: pattern.indexPadding,
      dateFormat: pattern.dateFormat,
    },
  );
  if (pattern.template !== '{name}') {
    operations.push('template');
  }

  // 5. Extension handling: if the template already references `{ext}`, the
  // template owns the extension placement (suffix is applied to the full
  // body).  Otherwise the pipeline always appends `.${ext}` after prefix and
  // suffix have been applied to the body, so `suffix` lands before the dot.
  const templateOwnsExtension = /\{ext(?:\}|[^}]*\})/u.test(pattern.template);

  // 6. Prefix / suffix
  let body = templated;
  if (pattern.prefix !== undefined && pattern.prefix.length > 0) {
    body = `${pattern.prefix}${body}`;
    operations.push('prefix');
  }
  if (pattern.suffix !== undefined && pattern.suffix.length > 0) {
    body = `${body}${pattern.suffix}`;
    operations.push('suffix');
  }

  const renamed = templateOwnsExtension ? body : `${body}.${ext}`;

  return {
    original,
    renamed,
    operations,
  };
}

// -----------------------------------------------------------------------------
// Public single-asset entry — validates the pattern, then delegates to the
// hot-path implementation.  Callers running a batch should use {@link
// renameBatch} instead so validation only runs once.
// -----------------------------------------------------------------------------

export function rename(asset: Asset, patternInput: unknown): RenameResult {
  return renameInternal(asset, validatePattern(patternInput));
}

// -----------------------------------------------------------------------------
// Batch pipeline
// -----------------------------------------------------------------------------

export function renameBatch(assets: readonly Asset[], pattern: unknown): readonly RenameResult[] {
  // Validate once up-front so the inner loop can rely on parsed pattern.
  const parsed = validatePattern(pattern);
  const results: RenameResult[] = new Array(assets.length);
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    if (asset === undefined) {
      // `length` was already consulted so undefined is unreachable.
      continue;
    }
    results[i] = renameInternal(asset, parsed);
  }
  return results;
}

/** Version constant for diagnostics. */
export const RENAME_VERSION = '1.0.0';
