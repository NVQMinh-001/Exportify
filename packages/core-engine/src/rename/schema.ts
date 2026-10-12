/**
 * Zod schemas describing the rename engine's public contracts.
 *
 * Every public type flows from a Zod schema so the same validator powers
 * runtime checks (preset import, transport bridges) and TypeScript types.
 */

import { z } from 'zod';

import { InvalidPatternError } from './errors.js';

// -----------------------------------------------------------------------------
// Casing
// -----------------------------------------------------------------------------

export const CasingSchema = z.enum(['none', 'kebab', 'snake', 'camel', 'pascal', 'lower', 'upper']);
export type Casing = z.infer<typeof CasingSchema>;

// -----------------------------------------------------------------------------
// Sanitize options
//
// Inputs are partial — the runtime defaults are applied by {@link sanitize}
// and by the pipeline via the {@link buildSanitizeOptions} helper, so the
// public type reflects "the user only has to set what they care about".
// -----------------------------------------------------------------------------

export const SanitizeOptionsSchema = z.object({
  nfc: z.boolean().optional(),
  stripControlChars: z.boolean().optional(),
  stripReserved: z.boolean().optional(),
  collapseWhitespace: z.boolean().optional(),
  transliterate: z.boolean().optional(),
  // Empty default keeps `stripControlChars=true` from leaving substitution
  // markers in the output; explicit `replacement` opts the caller into a
  // marker character.
  replacement: z.string().min(0).max(4).optional(),
  transliterationTable: z.record(z.string(), z.string()).optional(),
});

export type SanitizeOptions = z.infer<typeof SanitizeOptionsSchema>;

// -----------------------------------------------------------------------------
// Regex rule
// -----------------------------------------------------------------------------

const FLAG_SCHEMA = z
  .string()
  .regex(/^[gimsu]*$/u, 'flags must only contain g, i, m, s, u')
  .refine((flags) => {
    const hasG = flags.includes('g');
    const hasY = flags.includes('y');
    return !(hasG && hasY);
  }, 'flags may not combine g and y')
  .optional();

export const RegexRuleSchema = z.object({
  pattern: z.string().min(1).max(1024),
  flags: FLAG_SCHEMA,
  replacement: z.string().max(4096),
  global: z.boolean().optional(),
});

export type RegexRule = z.infer<typeof RegexRuleSchema>;

export interface ResolvedRegexRule {
  pattern: string;
  flags?: string;
  replacement: string;
  global: boolean;
}

export function resolveRegexRule(rule: RegexRule): ResolvedRegexRule {
  return {
    pattern: rule.pattern,
    ...(rule.flags !== undefined ? { flags: rule.flags } : {}),
    replacement: rule.replacement,
    global: rule.global ?? true,
  };
}

// -----------------------------------------------------------------------------
// Pattern
// -----------------------------------------------------------------------------

export const RenamePatternSchema = z.object({
  casing: CasingSchema.optional(),
  sanitize: z.union([z.boolean(), SanitizeOptionsSchema]).optional(),
  regex: RegexRuleSchema.optional(),
  // Default template is `{name}` — the pipeline appends `.${ext}` unless the
  // template itself owns the extension via `{ext}`.
  template: z.string().optional(),
  indexPadding: z.number().int().min(0).max(12).optional(),
  dateFormat: z.string().min(1).max(64).optional(),
  prefix: z.string().max(256).optional(),
  suffix: z.string().max(256).optional(),
  replaceExtension: z
    .string()
    .min(1)
    .max(16)
    .regex(/^[a-z0-9]+$/u)
    .optional(),
});

export type RenamePattern = z.infer<typeof RenamePatternSchema>;

// -----------------------------------------------------------------------------
// Asset
// -----------------------------------------------------------------------------

export const AssetSchema = z.object({
  name: z.string(),
  extension: z
    .string()
    .min(1)
    .max(16)
    .regex(/^[a-z0-9]+$/u),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().min(1).max(16).optional(),
  index: z.number().int().positive(),
  createdAt: z.date().optional(),
});

export type Asset = z.infer<typeof AssetSchema>;

// -----------------------------------------------------------------------------
// Result
// -----------------------------------------------------------------------------

export const RenameResultSchema = z.object({
  original: z.string().min(1),
  renamed: z.string().min(1),
  // Empty operations is allowed and means "identity rename" — the pipeline
  // passed every input through without applying a transformation step.
  operations: z.array(z.string()),
});

export type RenameResult = z.infer<typeof RenameResultSchema>;

// -----------------------------------------------------------------------------
// Default values — applied during {@link validatePattern} so downstream code
// can rely on a fully-populated pattern.
// -----------------------------------------------------------------------------

const PATTERN_DEFAULTS = {
  casing: 'none',
  sanitize: false,
  template: '{name}',
  indexPadding: 0,
  dateFormat: 'YYYY-MM-DD',
} as const;

const REGEX_RULE_DEFAULTS = {
  global: true,
} as const;

// -----------------------------------------------------------------------------
// Public validator
// -----------------------------------------------------------------------------

/**
 * Parse and validate an unknown value as a {@link RenamePattern}.
 *
 * Throws {@link InvalidPatternError} on validation failure, preserving the
 * raw Zod issues so callers can surface field-level diagnostics.
 */
export function validatePattern(input: unknown): RenamePattern {
  const result = RenamePatternSchema.safeParse(input);
  if (!result.success) {
    throw new InvalidPatternError(
      `Invalid RenamePattern: ${result.error.issues.map((i) => i.message).join('; ')}`,
      result.error.issues,
    );
  }
  const pattern = result.data;
  const normalizedRegex =
    pattern.regex !== undefined ? { ...REGEX_RULE_DEFAULTS, ...pattern.regex } : undefined;
  return {
    ...PATTERN_DEFAULTS,
    ...pattern,
    ...(normalizedRegex !== undefined ? { regex: normalizedRegex } : {}),
  };
}

// -----------------------------------------------------------------------------
// Resolved (defaults-applied) types for internal use
// -----------------------------------------------------------------------------

export interface ResolvedRenamePattern {
  casing: Casing;
  sanitize: boolean | SanitizeOptions;
  regex?: ResolvedRegexRule;
  template: string;
  indexPadding: number;
  dateFormat: string;
  prefix?: string;
  suffix?: string;
  replaceExtension?: string;
}

export interface ResolvedSanitizeOptions {
  nfc: boolean;
  stripControlChars: boolean;
  stripReserved: boolean;
  collapseWhitespace: boolean;
  transliterate: boolean;
  replacement: string;
  transliterationTable?: Record<string, string>;
}

export function resolveSanitizeOptions(
  options: Partial<SanitizeOptions> | undefined,
): ResolvedSanitizeOptions {
  return {
    nfc: options?.nfc ?? true,
    stripControlChars: options?.stripControlChars ?? true,
    stripReserved: options?.stripReserved ?? false,
    collapseWhitespace: options?.collapseWhitespace ?? true,
    transliterate: options?.transliterate ?? false,
    replacement: options?.replacement ?? '',
    ...(options?.transliterationTable !== undefined
      ? { transliterationTable: options.transliterationTable }
      : {}),
  };
}

export function resolvePattern(pattern: RenamePattern): ResolvedRenamePattern {
  return {
    casing: pattern.casing ?? 'none',
    sanitize: pattern.sanitize ?? false,
    ...(pattern.regex !== undefined ? { regex: resolveRegexRule(pattern.regex) } : {}),
    template: pattern.template ?? '{name}',
    indexPadding: pattern.indexPadding ?? 0,
    dateFormat: pattern.dateFormat ?? 'YYYY-MM-DD',
    ...(pattern.prefix !== undefined ? { prefix: pattern.prefix } : {}),
    ...(pattern.suffix !== undefined ? { suffix: pattern.suffix } : {}),
    ...(pattern.replaceExtension !== undefined
      ? { replaceExtension: pattern.replaceExtension }
      : {}),
  };
}
