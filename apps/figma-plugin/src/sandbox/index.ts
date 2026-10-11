/**
 * Figma plugin sandbox entry.
 *
 * Phase 0 placeholder. Phase 6 will:
 *   - walk the current selection,
 *   - collect image exports via `figma.createImage`,
 *   - hand bytes to the compression package running in a Web Worker,
 *   - stream a ZIP from the packer package,
 *   - trigger a `figma.base64Encode` download.
 *
 * Until then this file only declares its intent so the Figma plugin bundle
 * can be built and verified.
 */

export const SANDBOX_VERSION = '0.0.0';

if (typeof figma !== 'undefined') {
  // `__html__` is the iframe path injected by the Figma runtime in Phase 6.
  // For Phase 0 we just announce ourselves.
  figma.showUI('phase-0-placeholder', { width: 320, height: 480, themeColors: true });
}
