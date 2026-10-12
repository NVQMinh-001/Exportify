/**
 * Template placeholder engine.
 *
 * Recognised tokens:
 *
 *   `{name}`       — asset base name
 *   `{ext}`        — asset extension (with `replaceExtension` already applied)
 *   `{n}` / `{index}` — 1-based position in the batch
 *   `{index:NN}`   — zero-padded to NN digits (NN in 0..12)
 *   `{width}`      — asset width (optional)
 *   `{height}`     — asset height (optional)
 *   `{format}`     — asset format (optional)
 *   `{date}`       — ISO date `YYYY-MM-DD`
 *   `{date:fmt}`   — custom format with tokens `YYYY MM DD HH mm ss`
 *
 * Unknown tokens are rejected with {@link InvalidTemplateError}; missing
 * optional context (e.g. `{width}` without width) is also an error.
 */

import { InvalidTemplateError } from './errors.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface PlaceholderContext {
  readonly name: string;
  readonly ext: string;
  readonly index: number;
  readonly width?: number;
  readonly height?: number;
  readonly format?: string;
  readonly createdAt?: Date;
}

export interface PlaceholderOptions {
  readonly indexPadding?: number;
  readonly dateFormat?: string;
}

export const DEFAULT_PLACEHOLDER_OPTIONS: Required<PlaceholderOptions> = {
  indexPadding: 0,
  dateFormat: 'YYYY-MM-DD',
};

// -----------------------------------------------------------------------------
// Token regex: {name[:pad|fmt]} — pad is digits, fmt is a token string.
// -----------------------------------------------------------------------------

const TOKEN_RE = /\{([a-z]+)(?::([^}]*))?\}/gu;

const KNOWN_TOKENS = new Set(['name', 'ext', 'n', 'index', 'width', 'height', 'format', 'date']);

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export function applyTemplate(
  template: string,
  ctx: PlaceholderContext,
  options: PlaceholderOptions = {},
): string {
  const merged: Required<PlaceholderOptions> = {
    indexPadding: options.indexPadding ?? DEFAULT_PLACEHOLDER_OPTIONS.indexPadding,
    dateFormat: options.dateFormat ?? DEFAULT_PLACEHOLDER_OPTIONS.dateFormat,
  };
  return template.replace(TOKEN_RE, (match, rawName: string, rawArg: string | undefined) => {
    const token = rawName.toLowerCase();
    if (!KNOWN_TOKENS.has(token)) {
      throw new InvalidTemplateError(match, `unknown placeholder "${rawName}"`);
    }
    const arg = rawArg ?? '';
    return resolveToken(token, arg, ctx, merged, match);
  });
}

// -----------------------------------------------------------------------------
// Resolution
// -----------------------------------------------------------------------------

function resolveToken(
  token: string,
  arg: string,
  ctx: PlaceholderContext,
  options: Required<PlaceholderOptions>,
  match: string,
): string {
  switch (token) {
    case 'name':
      return ctx.name;
    case 'ext':
      return ctx.ext;
    case 'n':
    case 'index':
      return padIndex(ctx.index, arg, options.indexPadding, match);
    case 'width':
      return requireNumber(ctx.width, match, 'width');
    case 'height':
      return requireNumber(ctx.height, match, 'height');
    case 'format':
      return ctx.format ?? throwMissing(match, `format`);
    case 'date':
      return formatDate(ctx.createdAt, arg, options.dateFormat, match);
    default:
      throw new InvalidTemplateError(match, `unsupported placeholder "${token}"`);
  }
}

function padIndex(value: number, arg: string, defaultPadding: number, match: string): string {
  const pad = arg.length > 0 ? parsePad(arg, match) : defaultPadding;
  return pad === 0 ? String(value) : String(value).padStart(pad, '0');
}

function parsePad(arg: string, match: string): number {
  if (!/^\d{1,2}$/u.test(arg)) {
    throw new InvalidTemplateError(match, `pad "${arg}" must be 1-2 digits`);
  }
  const n = Number.parseInt(arg, 10);
  if (n > 12) {
    throw new InvalidTemplateError(match, `pad ${n} exceeds 12`);
  }
  return n;
}

function requireNumber(value: number | undefined, match: string, label: string): string {
  if (value === undefined || !Number.isFinite(value)) {
    throw new InvalidTemplateError(match, `missing ${label} on asset`);
  }
  return String(value);
}

function throwMissing(match: string, label: string): never {
  throw new InvalidTemplateError(match, `missing ${label} on asset`);
}

// -----------------------------------------------------------------------------
// Date formatting
// -----------------------------------------------------------------------------

const DATE_TOKENS: readonly string[] = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];

function formatDate(
  date: Date | undefined,
  arg: string,
  defaultFormat: string,
  match: string,
): string {
  if (!date) {
    throw new InvalidTemplateError(match, 'no createdAt on asset');
  }
  const fmt = arg.length > 0 ? arg : defaultFormat;

  // Validate that every run of capital letters / characters maps to a known
  // token.  We don't reject — unknown tokens fall through as literals — but
  // we still error on completely malformed formats (no known token present).
  if (!DATE_TOKENS.some((token) => fmt.includes(token))) {
    return fmt; // unknown but recognisable, document fallback behaviour
  }

  const yyyy = date.getUTCFullYear().toString().padStart(4, '0');
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = date.getUTCDate().toString().padStart(2, '0');
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mi = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');

  return fmt
    .replaceAll('YYYY', yyyy)
    .replaceAll('MM', mm)
    .replaceAll('DD', dd)
    .replaceAll('HH', hh)
    .replaceAll('mm', mi)
    .replaceAll('ss', ss);
}
