import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { plugin as devtools, recommendedConfig } from '@dloizides/frontend-devtools/eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'docs/**', 'public/**', 'test-results/**', 'playwright-report/**', '*.config.js', '*.config.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser, ...globals.node } },
    plugins: { '@dloizides': devtools },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@dloizides/no-raw-color-literal': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'max-lines': ['error', { max: 300, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
    },
  },
  { files: ['**/*.test.ts', 'e2e/**/*.ts'], rules: { 'max-lines-per-function': 'off' } },
  { ...recommendedConfig, files: ['**/*.ts'] },
);
