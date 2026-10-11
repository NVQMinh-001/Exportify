import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Base ESLint flat config shared by all Exportify packages and apps.
 *
 * Strategy:
 *  - Non-type-aware rules + project service ONLY for `src/**` and `tests/**`.
 *  - Config files (`*.config.*`, `eslint.config.mjs`, etc.) get non-type-aware
 *    rules without the project service so ESLint never needs to find a
 *    tsconfig for them.
 *  - Type-aware rules (strictTypeChecked, stylisticTypeChecked) layered on
 *    top of the project service, also scoped to `src/**` and `tests/**`.
 *  - Prettier compatibility at the bottom.
 *
 * Splitting project service by file glob is required because
 * `allowDefaultProject` patterns in 8.x are picomatch against backslash paths
 * on Windows and don't reliably match file basenames.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  // Stage 1: file ignores.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.min.js',
    ],
  },

  // Stage 2: non-type-aware defaults for every file (no project service).
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'multi-line'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Stage 3: project service + type-aware rules for source and test files only.
  {
    files: ['**/src/**/*.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tseslint.configs.strictTypeChecked.map((c) => ({
    ...c,
    files: ['**/src/**/*.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({
    ...c,
    files: ['**/src/**/*.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
  })),
  {
    files: ['**/src/**/*.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: false, allowNullish: false, allowAny: false },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // Stage 4: relax linting inside test files.
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-console': 'off',
    },
  },

  // Stage 5: Prettier compatibility (formatting is Prettier's job).
  prettier,
];
