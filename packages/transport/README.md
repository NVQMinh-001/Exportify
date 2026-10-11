# @exportify/transport

Cross-boundary message bridges and Zod schemas. The single source of truth for
every message that crosses the sandbox, the iframe, the MV3 service worker, or
the MV3 offscreen document.

## Status

Phase 0 placeholder. Only exposes `TRANSPORT_VERSION`. Later phases will add:

- `figma-bridge.ts` — sandbox <-> iframe message router.
- `extension-bridge.ts` — popup <-> service worker <-> offscreen document router.
- `schemas.ts` — Zod schemas for every payload, imported by both apps.

## Rule

Every message must be Zod-validated on both sides. A malformed message is a
hard error, not a warning, so neither runtime can crash on unexpected input.
