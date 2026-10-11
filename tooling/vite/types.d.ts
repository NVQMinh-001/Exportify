/**
 * Type declarations for the shared Vite plugins.
 *
 * The plugins are implemented in `.mjs` (ESM) and have JSDoc type annotations.
 * Because they are JavaScript files consumed by Vite, this `.d.ts` file is
 * the contract TypeScript uses when an app imports the plugin.
 */

declare module '@exportify/vite-plugins/plugin-figma' {
  import type { PluginOption } from 'vite';

  export interface FigmaPluginOptions {
    /** Absolute path to the Figma plugin app directory. Defaults to `process.cwd()`. */
    root?: string;
  }

  export function figmaPlugin(options?: FigmaPluginOptions): PluginOption[];

  const _default: (options?: FigmaPluginOptions) => PluginOption[];
  export default _default;
}

declare module '@exportify/vite-plugins/plugin-mv3' {
  import type { PluginOption } from 'vite';

  export interface Mv3PluginOptions {
    /** Absolute path to the browser-extension app directory. Defaults to `process.cwd()`. */
    root?: string;
  }

  export function mv3Plugin(options?: Mv3PluginOptions): PluginOption[];

  const _default: (options?: Mv3PluginOptions) => PluginOption[];
  export default _default;
}
