# @exportify/core-engine

Pure TypeScript engine for renaming, foldering, and pipeline coordination. Has
**zero DOM dependencies** so it runs identically in a Web Worker, a Figma
sandbox, an MV3 service worker, and Node tests.

## Status

Phase 0 placeholder. Only exposes `CORE_ENGINE_VERSION`. Real surface lands in
Phase 1 (`rename/*`) and Phase 2 (`folder/*`).

## Planned subpaths

| Subpath                         | Responsibility                                           |
| ------------------------------- | -------------------------------------------------------- |
| `@exportify/core-engine`        | Public surface (re-exports `rename`, `folder`, `types`). |
| `@exportify/core-engine/rename` | Casing, placeholders, regex find/replace, sanitization.  |
| `@exportify/core-engine/folder` | Tag-based folder rules and collision-safe path tree.     |
| `@exportify/core-engine/types`  | Shared asset / preset / pipeline types.                  |

## Conventions

- No DOM globals (`lib: ["ES2022"]` only).
- No `any`. Strict mode + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- 100% branch coverage in the rename engine (target).
