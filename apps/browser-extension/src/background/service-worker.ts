/**
 * MV3 service worker entry.
 *
 * Phase 0 placeholder. Phase 7 will:
 *   - own the `chrome.runtime.onMessage` router,
 *   - delegate heavy work to the offscreen document,
 *   - trigger `chrome.downloads.download` with a `blob:` URL.
 *
 * For now this only announces its presence so the build has a real entry.
 */

export const SERVICE_WORKER_VERSION = '0.0.0';

if (typeof self !== 'undefined' && 'addEventListener' in self) {
  self.addEventListener('install', () => {
    // Intentionally empty in Phase 0.
  });
}
