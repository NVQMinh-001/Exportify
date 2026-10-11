# @exportify/figma-plugin

Figma plugin shell for Exportify. This package is currently a Phase 0 placeholder
that compiles to a two-entry Vite build (`code` for the sandbox and `ui` for the
iframe). All real work lives in `packages/*`.

## Run

```bash
pnpm --filter @exportify/figma-plugin dev      # local dev with HMR
pnpm --filter @exportify/figma-plugin build    # production build -> dist/
```

## Layout

```
src/
  sandbox/   # figma.* API surface (entry: code.ts)
  ui/        # iframe entry (entry: ui.html)
```

The `build` step writes a `plugin.json` next to the bundle, but loading the
plugin into the Figma desktop app is a manual step (drag `dist/` onto a Figma
file). See the root `README.md` for the full architecture map.
