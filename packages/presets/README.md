# @exportify/presets

Built-in and user-defined export presets. Plain JSON, Zod-validated, shareable
across the Figma plugin and the browser extension.

## Status

Phase 0 placeholder. Only exposes `PRESETS_VERSION`. Phase 8 will ship the
three built-in presets plus the user-defined `custom` shape.

## Built-in presets

| Preset         | Use case                                        |
| -------------- | ----------------------------------------------- |
| `react-native` | @1x/@2x/@3x PNG, grouped by screen, PascalCase. |
| `web-app`      | SVG-first, kebab-case, tree-shakeable index.    |
| `marketing`    | WebP + JPEG, hero/social/card matrix.           |
| `icon-library` | SVG spritesheet + per-icon PNG @1x/@2x.         |
| `custom`       | User-defined preset shape (Zod-validated).      |

## Persistence

The same preset JSON round-trips through `figma.clientStorage` and
`chrome.storage.local` because the schema lives in this package.
