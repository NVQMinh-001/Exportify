# @exportify/compression

WebAssembly-based asset compression that always runs in a Comlink Web Worker.

## Status

Phase 0 placeholder. Only exposes `COMPRESSION_VERSION`. Phase 3 will add:

- `svg.ts` — SVGO wrapper with a configurable plugin set.
- `raster.ts` — `@jsquash/{webp,png,jpeg}` encode/decode wrappers.
- `matrix.ts` — `@1x/@2x/@3x` generator via `createImageBitmap` + `OffscreenCanvas`.
- `worker.ts` — single `process(asset): ProcessedAsset` API exposed over Comlink.

## Constraints

- The worker is shared across the Figma iframe, the MV3 service worker, and
  the MV3 offscreen document.
- WASM files are code-split per format and lazy-loaded on first use.
- Concurrency is capped at `navigator.hardwareConcurrency - 1`.
