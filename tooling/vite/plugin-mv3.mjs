/**
 * Shared Vite plugin for the MV3 browser extension app.
 *
 * Responsibilities:
 *  - Build the popup, options, content, background, and offscreen entries
 *    from `apps/browser-extension/src/*` into `dist/`.
 *  - Copy `public/` assets (icons, manifest) into `dist/`.
 *  - Tag every output as MV3-safe (no `eval`, ES2020 target).
 *
 * The plugin is intentionally tiny in Phase 0. Later phases will add
 * content-script auto-injection helpers and offscreen-document bundling.
 */

import { resolve } from 'node:path';

/**
 * Return a Vite plugin array suitable for `apps/browser-extension/vite.config.ts`.
 *
 * @param {{ root?: string }} [options]
 *   - `root`: the extension app directory (defaults to `process.cwd()`).
 * @returns {import('vite').PluginOption[]}
 */
export function mv3Plugin(options = {}) {
  const root = options.root ?? process.cwd();
  const srcDir = resolve(root, 'src');

  /** @type {import('vite').PluginOption[]} */
  return [
    {
      name: 'exportify:mv3-scaffold',
      config() {
        return {
          appType: 'mpa',
          define: {
            'import.meta.env.EXPORTIFY_TARGET': JSON.stringify('browser-extension'),
          },
          build: {
            target: 'es2020',
            outDir: 'dist',
            emptyOutDir: true,
            cssCodeSplit: false,
            sourcemap: true,
            rollupOptions: {
              input: {
                popup: resolve(srcDir, 'popup', 'main.tsx'),
                options: resolve(srcDir, 'options', 'main.tsx'),
                content: resolve(srcDir, 'content', 'index.ts'),
                background: resolve(srcDir, 'background', 'service-worker.ts'),
                offscreen: resolve(srcDir, 'offscreen', 'worker.ts'),
              },
            },
          },
        };
      },
    },
  ];
}

export default mv3Plugin;
