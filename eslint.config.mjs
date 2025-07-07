import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // ✅ Ignore your build output
  { ignores: ['dist'] },

  // ✅ Your main config block
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser, // ✅ Use @typescript-eslint/parser for TS syntax
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      // ✅ Resolve your `@/` aliases using tsconfig.json
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin, // ✅ Register the TS plugin for your rules
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    rules: {
      /* 👉 React Hooks best practices */
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* 👉 Unused code cleanup */
      '@typescript-eslint/no-unused-vars': 'off', // disable core check, use unused-imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      /* 👉 Basic TS best practice */
      '@typescript-eslint/no-explicit-any': 'warn',

      /* 👉 Import plugin recommended rules (manually) */
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/no-mutable-exports': 'error',

      /* 👉 Enforce import order & sorting */
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  }
);
