/**
 * Ambient declarations for the Figma plugin sandbox runtime.
 *
 * Phase 0 placeholder. The real Figma plugin API surface is much larger and
 * will be declared in `packages/transport/figma-bridge.ts` in Phase 6.
 */

declare global {
  /**
   * Minimal subset of the Figma plugin API needed to compile the Phase 0
   * sandbox entry. Phase 6 will replace this with the full `PluginAPI`
   * interface from `@figma/plugin-typings`.
   */
  const figma: {
    showUI(
      html: string,
      options?: { width?: number; height?: number; themeColors?: boolean },
    ): void;
  };
}

export {};
