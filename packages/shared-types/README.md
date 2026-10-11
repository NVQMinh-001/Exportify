# @exportify/shared-types

Type-only package with the shared `Asset`, `Message`, and `Pipeline` types
referenced by every other package. Type-only so it adds zero runtime weight.

## Status

Phase 0 placeholder. Only exposes `SHARED_TYPES_VERSION`.

## Why a separate package?

- Keeps the dependency graph acyclic: every leaf package can import from
  `shared-types` without pulling in any runtime code.
- Acts as the contract between packages, the Figma app, and the extension
  app.
