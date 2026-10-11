# @exportify/packer

Streaming ZIP packer that consumes the folder tree from `@exportify/core-engine`.

## Status

Phase 0 placeholder. Only exposes `PACKER_VERSION`. Phase 5 will add the
fflate-backed streaming ZIP and the folder-tree builder.

## Design rules

- Deterministic ordering (sorted by path).
- Atomic close: build into a `Blob` in memory, only commit to disk / download
  once the ZIP is fully closed.
- 1000-file ZIP target: < 2 s on a mid-tier laptop.
