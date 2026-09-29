// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'public/',
      'source-material/',
      '.qa/',
      '.claude/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  // Accessibility rules for .astro templates (eslint-plugin-jsx-a11y-x, ESLint 10 compatible).
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ['*.config.{js,mjs,ts}', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
