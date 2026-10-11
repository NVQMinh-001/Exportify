import base from './base.mjs';
import globals from 'globals';

/**
 * Node-targeted ESLint config for tooling packages, scripts, and service-worker
 * style code. Disables browser globals and keeps the strict type-checked rules
 * from the base config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
];
