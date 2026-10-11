# @exportify/browser-extension

MV3 browser extension shell for Exportify. Phase 0 placeholder that compiles
to a five-entry Vite build (`popup`, `options`, `content`, `background`,
`offscreen`). Real work lives in `packages/*`.

## Run

```bash
pnpm --filter @exportify/browser-extension dev      # local dev with HMR
pnpm --filter @exportify/browser-extension build    # production build -> dist/
```

## Loading unpacked in Chrome

1. Run `pnpm --filter @exportify/browser-extension build`.
2. Open `chrome://extensions/`.
3. Enable "Developer mode".
4. Click "Load unpacked" and pick `apps/browser-extension/dist/`.

## Layout

```
src/
  background/   # MV3 service worker
  content/      # content script (page asset interception)
  popup/        # toolbar popup
  options/      # full options page
  offscreen/    # OffscreenDocument for heavy work
public/
  manifest.json # MV3 manifest
  icons/        # 16/32/48/128 (added in a later phase)
```
