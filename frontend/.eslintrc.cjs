module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript/recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // Only warn for TS errors, don't break build
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-empty': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    // Add more rules as needed
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
