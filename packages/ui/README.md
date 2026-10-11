# @exportify/ui

Shared React 18 UI used by the Figma iframe, the extension popup, and the
extension options page. Tailwind v3 with shared design tokens.

## Status

Phase 0 placeholder. Only exposes `UI_VERSION`. Phase 4 will add:

- `components/` — Button, Input, Select, Checkbox, Table, Tabs, Tooltip, Toast.
- `hooks/` — `useDebounce`, `useMediaQuery`, etc.
- `theme/` — `tokens.css` (light + dark CSS variables) and `ThemeProvider`.
- `store/` — zustand slices: `rename`, `export`, `presets`, `theme`.
- `icons/` — re-exports of `lucide-react`.

## Conventions

- All components are pure (no side effects, no global state).
- All state flows through zustand slices in `./store`.
- Light/dark theme is read from `prefers-color-scheme` with an explicit user override.
- The data table uses `@tanstack/react-virtual` for row virtualization.
