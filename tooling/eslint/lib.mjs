import base from './base.mjs';

/**
 * Library (publishable package) ESLint config. Identical to the base
 * config but pins the language target to pure TypeScript with no DOM
 * globals so packages stay framework-agnostic.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...base,
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
