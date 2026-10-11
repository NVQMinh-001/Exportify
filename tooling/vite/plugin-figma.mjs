/**
 * Shared Vite plugin for the Figma plugin app.
 *
 * Responsibilities:
 *  - Build two entry points (sandbox `code.ts` and iframe `ui.html`) into `dist/`.
 *  - Inline a stub plugin manifest in dev so the Figma desktop app can load it.
 *  - Disable `eval` (Figma CSP forbids it) and keep the bundle under 25 MB.
 *
 * The plugin is intentionally tiny in Phase 0 — the app shells it powers are
 * empty placeholders. Later phases will add code-splitting, WASM lazy-loading,
 * and manifest injection.
 */

import { resolve } from 'node:path';

/**
 * Return a Vite plugin array suitable for `apps/figma-plugin/vite.config.ts`.
 *
 * @param {{ root?: string }} [options]
 *   - `root`: the Figma plugin app directory (defaults to `process.cwd()`).
 * @returns {import('vite').PluginOption[]}
 */
export function figmaPlugin(options = {}) {
  const root = options.root ?? process.cwd();
  const uiDir = resolve(root, 'src', 'ui');
  const sandboxDir = resolve(root, 'src', 'sandbox');

  /** @type {import('vite').PluginOption[]} */
  return [
    {
      name: 'exportify:figma-scaffold',
      config() {
        return {
          appType: 'mpa',
          define: {
            'import.meta.env.EXPORTIFY_TARGET': JSON.stringify('figma-plugin'),
          },
          build: {
            target: 'es2020',
            outDir: 'dist',
            emptyOutDir: true,
            cssCodeSplit: false,
            sourcemap: true,
            rollupOptions: {
              input: {
                code: resolve(sandboxDir, 'index.ts'),
                ui: resolve(uiDir, 'main.tsx'),
              },
            },
          },
        };
      },
    },
  ];
}

export default figmaPlugin;
