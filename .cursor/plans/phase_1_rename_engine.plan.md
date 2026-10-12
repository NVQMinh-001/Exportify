# Plan: Phase 1 — Core Rename Engine (`@exportify/core-engine/rename`)

**Source PRD/Plan**: `.cursor/plans/exportify_architecture_plan_81f389ae.plan.md` §3 Phase 1
**Phase**: 1 (rename engine only; folder engine is Phase 2 — HARD STOP)
**Complexity**: Medium

## Summary

Ship the deterministic, pure-TypeScript rename engine powering Phase 1 of
Exportify. The engine must convert, sanitize, regex-rewrite, placeholder-fill,
and template-assemble filenames safely (ReDoS-resistant via `safe-regex`) and
fast (50 000 items under 300 ms). Public surface ships as
`@exportify/core-engine/rename`.

## Pattern Grounding

| Category      | Source                                                                  | Pattern                                                                    |
| ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Module style  | `packages/core-engine/src/index.ts`                                     | Barrel exports + version constant                                          |
| Test location | `packages/core-engine/tests/index.test.ts`                              | Co-located under `tests/` using vitest, `.js` import suffix                |
| Strict TS     | `tooling/tsconfig/lib.json` + `tsconfig.base.json`                      | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `strict`, ES2022 |
| Subpath map   | `packages/core-engine/package.json#exports`                             | Each subpath maps to `./src/<sub>/index.ts`                                |
| Vitest config | `packages/core-engine/vitest.config.ts`                                 | `node` env, `v8` coverage, `tests/**/*.test.ts` + `src/**/*.test.ts`       |
| Plan source   | `.cursor/plans/exportify_architecture_plan_81f389ae.plan.md` §3 Phase 1 | Defines casing, placeholders, regex safety, sanitization requirements      |

## Files to Change

| File                                              | Action           | Why                                              |
| ------------------------------------------------- | ---------------- | ------------------------------------------------ |
| `packages/core-engine/src/rename/casing.ts`       | CREATE           | Casing converters                                |
| `packages/core-engine/src/rename/placeholders.ts` | CREATE           | Template placeholder engine                      |
| `packages/core-engine/src/rename/regex.ts`        | CREATE           | Safe regex compile + replace                     |
| `packages/core-engine/src/rename/sanitize.ts`     | CREATE           | NFC + control + whitespace + transliteration     |
| `packages/core-engine/src/rename/schema.ts`       | CREATE           | Zod schemas (RenamePattern, Asset, RenameResult) |
| `packages/core-engine/src/rename/errors.ts`       | CREATE           | Typed `RenameError` subclasses                   |
| `packages/core-engine/src/rename/index.ts`        | UPDATE           | Public API + `rename` / `renameBatch`            |
| `packages/core-engine/src/rename/*.test.ts`       | CREATE           | Unit tests per module + 50k benchmark            |
| `packages/core-engine/package.json`               | UPDATE (already) | Added `zod` + `safe-regex` to dependencies       |
| `pnpm-lock.yaml`                                  | UPDATE           | Lockfile reflects dep install                    |

## Public Surface (`@exportify/core-engine/rename`)

```ts
export type Casing = 'none' | 'kebab' | 'snake' | 'camel' | 'pascal' | 'lower' | 'upper';
export type PlaceholderContext = {
  name: string;
  ext: string;
  width?: number;
  height?: number;
  format?: string;
  index: number; // 1-based for {index}
  date?: Date;
};

export interface SanitizeOptions {
  nfc?: boolean; // default true
  stripControlChars?: boolean; // default true
  collapseWhitespace?: boolean; // default true
  transliterate?: boolean; // default false (no built-in table; pass table)
  replacement?: string; // default '_'
}

export interface RegexRule {
  pattern: string;
  flags?: string; // must not contain 'g'+'y' together
  replacement: string;
  global?: boolean; // default true
}

export interface RenamePattern {
  casing?: Casing;
  sanitize?: boolean | SanitizeOptions; // default false
  regex?: RegexRule;
  template?: string; // default '{name}'; supports {name}, {ext}, {index}, {n}, {width}, {height}, {format}, {date[:fmt]}
  indexPadding?: number; // default 0 (no zero pad)
  dateFormat?: string; // date-fns style tokens; default 'YYYY-MM-DD'
  prefix?: string;
  suffix?: string;
  replaceExtension?: string; // override ext
}

export interface Asset {
  name: string; // base name without extension
  extension: string; // 'svg', 'png', ...
  width?: number;
  height?: number;
  format?: string;
  index: number; // 1-based
  createdAt?: Date;
}

export interface RenameResult {
  original: string; // 'foo.png'
  renamed: string; // 'foo-bar_001.png'
  operations: ReadonlyArray<string>; // trace of steps applied
}

export function rename(asset: Asset, pattern: RenamePattern): RenameResult;
export function renameBatch(
  assets: ReadonlyArray<Asset>,
  pattern: RenamePattern,
): ReadonlyArray<RenameResult>;
export function compileRegex(rule: RegexRule): RegExp; // throws UnsafeRegexError
export function validatePattern(pattern: unknown): RenamePattern; // Zod-parse, throws InvalidPatternError
```

## ReDoS Rejection Contract

- `compileRegex` calls `safe-regex(rule.pattern, options)` with
  `{ limit: 1000, starHeight: 4 }` (star-height = maximum quantifier nesting depth).
- If `safe-regex` returns `false`, throw `UnsafeRegexError` (subclass of `RenameError`)
  with the original pattern + a human-readable message. No `RegExp` is returned.
- Flags are restricted: must be a subset of `g i m s u y`. The `g` + `y` combo is
  rejected because `safe-regex` cannot statically analyze it; we also forbid it
  in the Zod schema.
- The unit suite includes a negative test exercising the rejection contract with
  a known ReDoS pattern: `^(a+)+$`.

## Pipeline (in deterministic order)

1. Validate pattern via `RenamePatternSchema` (Zod). Throws `InvalidPatternError`.
2. NFC-normalize, strip control chars, collapse whitespace, optionally transliterate.
3. Apply casing to the sanitized name (no-op when `casing === 'none'`).
4. Apply regex find/replace if provided (compile → replace all).
5. Resolve template: substitute `{name}`, `{ext}`, `{index}`, `{n}`,
   `{width}`, `{height}`, `{format}`, `{date[:fmt]}`.
6. Apply prefix + suffix.
7. Optionally override extension (`replaceExtension`).
8. Record operations in `RenameResult.operations` for observability.

`renameBatch(assets, pattern)` is a pure loop over the single-asset pipeline;
the 50 000-item benchmark asserts total elapsed time < 300 ms.

## Performance Budget

| Operation | Budget per item (≈) | Notes                           |
| --------- | ------------------- | ------------------------------- |
| Sanitize  | < 1 µs              | String scan + replace           |
| Casing    | < 2 µs              | Regex word split + join         |
| Regex     | < 5 µs              | Only when pattern provides it   |
| Template  | < 2 µs              | String concat + replace         |
| Total     | < 10 µs / item      | 50 000 × 10 µs = 500 ms ceiling |

The benchmark test enforces a wall-clock < 300 ms — well within budget on
modern hardware (V8 can do regex-free paths in 50 ns / item). We avoid `gc()` in
the hot path: pre-compute template literal once for the whole batch.

GC pause < 50 ms is enforced by reusing a single `RenameResult` shape and not
allocating intermediate arrays during sanitization. The benchmark asserts the
wall-clock for the whole batch (single biggest measure) so a 50 ms GC pause
inside the 300 ms envelope is acceptable; the test does not need to call
`performance.measureUserAgentSpecificMemory()` (not portable to a worker).

## Coverage Targets

- `rename/**` ≥ 95 % lines / branches / functions.
- 100 % on the public API surface: `rename`, `renameBatch`, `compileRegex`,
  `validatePattern`, exported type guards.

## Tasks

### Task 1 — Schema & errors

- **Action**: Create `errors.ts` (`RenameError`, `UnsafeRegexError`,
  `InvalidPatternError`, `InvalidTemplateError`) and `schema.ts` (Zod schemas).
- **Mirror**: `src/index.ts` version-style exports.
- **Validate**: unit tests asserting `instanceof` hierarchy + Zod error mapping.

### Task 2 — Casing

- **Action**: Implement `toKebab`, `toSnake`, `toCamel`, `toPascal`, `toLower`,
  `toUpper` plus the `applyCasing(name, casing)` dispatcher.
- **Mirror**: small pure functions, no allocations in hot path.
- **Validate**: per-case unit tests + cross-form idempotency (`toKebab(toKebab(x)) === toKebab(x)`).

### Task 3 — Placeholders

- **Action**: Implement `applyTemplate(template, ctx, options)`. Tokenize once,
  resolve placeholders, handle `{index:04}` / `{index padding=4}` zero-padding,
  handle `{date}` (ISO) and `{date:YYYYMMDD-HHmm}` (date-fns-like tokens).
- **Validate**: per-placeholder unit tests + zero-pad + unknown-placeholder error.

### Task 4 — Safe regex

- **Action**: Implement `compileRegex(rule)` using `safe-regex` with
  `{ limit: 1000, starHeight: 4 }`. Reject `g + y` combo.
- **Validate**: negative test for `^(a+)+$`; positive tests for safe patterns.

### Task 5 — Sanitize

- **Action**: Implement NFC normalize, control-char strip, whitespace collapse,
  transliteration hook.
- **Validate**: NFC round-trip, control chars removed, whitespace collapsed,
  optional transliteration.

### Task 6 — Main API & benchmark

- **Action**: Wire `rename` and `renameBatch`; export from `index.ts`.
- **Validate**: end-to-end tests + 50 000-item benchmark asserting < 300 ms.

### Task 7 — Verification gate

- **Action**: `pnpm --filter @exportify/core-engine test` + coverage report.
- **Goal**: ≥ 95 % coverage on `rename/**`.

## Validation

```bash
pnpm --filter @exportify/core-engine test
pnpm --filter @exportify/core-engine typecheck
pnpm --filter @exportify/core-engine lint
```

## Risks

| Risk                                                      | Likelihood | Mitigation                                                                                    |
| --------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `safe-regex` v2 has different API than v1 docs            | Low        | Pin `safe-regex@^2.1.1`, wrap in adapter, write the negative test early                       |
| Zod version skew                                          | Low        | Pin `zod@^3.23.8`                                                                             |
| 50 000 benchmark drifts over time                         | Medium     | Pin the bench to 50 000 items, use `Date.now()` diff over `performance.now()` for portability |
| Flag `g + y` combo is partially supported by `safe-regex` | Low        | Reject at schema-level, do not delegate to engine                                             |

## Acceptance

- [ ] All tasks complete
- [ ] `pnpm --filter @exportify/core-engine test` green
- [ ] Coverage ≥ 95 % on `rename/**`, 100 % on public API
- [ ] 50 000-item benchmark < 300 ms
- [ ] ReDoS negative test exercises the rejection path
- [ ] Conventional commit landed referencing this plan section
- [ ] NO `folder/`, `compression/`, `packer/`, `ui/`, `transport/`, `presets/` files touched
