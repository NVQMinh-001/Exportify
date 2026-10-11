# @exportify/vite-plugins

Shared Vite plugins and config helpers for the two Exportify apps.

## Plugins

| Export                                 | Use for                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `@exportify/vite-plugins/plugin-figma` | `apps/figma-plugin` sandbox + iframe multi-entry build.                  |
| `@exportify/vite-plugins/plugin-mv3`   | `apps/browser-extension` popup, options, content, background, offscreen. |

## Conventions enforced

- `es2020` target (Figma's runtime is older than evergreen browsers).
- `cssCodeSplit: false` to keep the iframe / popup CSS in a single file.
- `emptyOutDir: true` so each build is reproducible.
- Source maps on for both apps.

## Usage

In an app `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { figmaPlugin } from '@exportify/vite-plugins/plugin-figma';

export default defineConfig({
  plugins: [figmaPlugin({ root: __dirname })],
});
```
