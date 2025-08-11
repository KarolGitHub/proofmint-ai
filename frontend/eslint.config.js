import js from '@eslint/js';
import globals from 'globals';

// SIMPLE ESLINT CONFIG - Only rules that actually exist
export default [
  // Base JavaScript config
  js.configs.recommended,

  // Global config for all files
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
      },
    },
    rules: {
      // Only rules that actually exist in @eslint/js
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // Everything else is off
      'no-empty': 'off',
      'prefer-promise-reject-errors': 'off',
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
      'no-restricted-properties': 'off',
    },
  },
];
