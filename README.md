# Exportify

Cross-platform client-side batch asset exporter: a Figma plugin and an MV3
browser extension that share a TypeScript core engine via a pnpm + Turborepo
monorepo.

> **Status: Phase 0 — Foundation.** This commit ships the monorepo skeleton
> only. `pnpm i && turbo run build lint typecheck test` is green; every
> package and app is a placeholder.

## Layout

```
exportify/
  pnpm-workspace.yaml     # workspace declaration
  turbo.json              # task pipeline (build / lint / typecheck / test)
  tsconfig.base.json      # strict TS defaults
  package.json            # root devDependencies + hooks

  apps/
    figma-plugin/         # Figma sandbox + iframe shell
    browser-extension/    # MV3 popup / options / service worker shell

  packages/
    core-engine/          # pure TS rename + foldering engine
    compression/          # WASM compression in a Web Worker
    packer/               # streaming ZIP builder
    presets/              # built-in and user-defined export presets
    ui/                   # shared React 18 UI + theme + zustand store
    transport/            # cross-boundary bridges + Zod schemas
    shared-types/         # type-only shared contracts

  tooling/
    tsconfig/             # base / react / node / lib
    eslint/               # shared flat configs (base / node / react / lib)
    vite/                 # shared Vite plugins (plugin-figma, plugin-mv3)
```

## Requirements

- Node.js 20+ (see `.nvmrc`).
- pnpm 9+ (`corepack enable pnpm` or `npm i -g pnpm`).
- A Figma desktop install (only needed for `apps/figma-plugin` runtime).
- A Chromium browser (only needed for `apps/browser-extension` runtime).

## Quick start

```bash
pnpm install
pnpm build           # turbo run build across every package
pnpm lint            # eslint flat config
pnpm typecheck       # tsc --noEmit
pnpm test            # vitest run
```

All four commands are orchestrated by Turbo and run in parallel where the
dependency graph allows.

## Workspace tasks

Every workspace project exposes the same script surface:

| Script      | What it does                                            |
| ----------- | ------------------------------------------------------- |
| `build`     | `vite build` for apps, `tsc -p tsconfig.json` for libs. |
| `lint`      | ESLint flat config (typescript-eslint strict).          |
| `typecheck` | `tsc --noEmit` with the shared strict tsconfig.         |
| `test`      | `vitest run` (Node or jsdom depending on package).      |
| `clean`     | Remove `dist/`, `.turbo/`, coverage, etc.               |

## Contributing

- Conventional Commits enforced by `commitlint` on commit-msg.
- Pre-commit hook runs `lint-staged` (Prettier write on staged files).
- CI on GitHub Actions mirrors the four root scripts in parallel.
- Read `.cursor/plans/exportify_architecture_plan_*.md` for the full
  execution roadmap and design rules.
