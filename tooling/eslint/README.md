# @exportify/eslint-config

Shared ESLint flat configs for every workspace in the Exportify monorepo.

## Variants

| Entry                            | Use for                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `@exportify/eslint-config/base`  | Any project that wants the strict shared ruleset.         |
| `@exportify/eslint-config/node`  | Node-only code (tooling, scripts, MV3 service workers).   |
| `@exportify/eslint-config/react` | React + browser code (UI, Figma iframe, extension popup). |
| `@exportify/eslint-config/lib`   | Publishable TypeScript libraries (relaxed unsafe rules).  |

## Usage

In a package `eslint.config.mjs`:

```js
import reactConfig from '@exportify/eslint-config/react';

export default reactConfig;
```

## Conventions enforced

- `strictTypeChecked` + `stylisticTypeChecked` from `typescript-eslint`.
- `consistent-type-imports` (inline type imports).
- `no-console` (warn / error only).
- `no-non-null-assertion` and `no-explicit-any` errors.
- `eqeqeq` with `null: ignore` to allow `x == null`.
- Prettier compatibility at the bottom (formatting is Prettier's job).
