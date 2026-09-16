import tseslint from 'typescript-eslint';

/** Publish graph only — PR-79: ban `any` on the types that can leak to dist. */
export default tseslint.config({
  files: [
    'publish/**/*.ts',
    'application/**/*.ts',
    'bootstrap/**/*.ts',
    'domain/**/*.ts',
    'engine/**/*.ts',
    'infrastructure/**/*.ts',
    'packages/plugins/**/*.ts',
    'ui/**/*.ts',
    'ui/**/*.tsx',
  ],
  ignores: ['**/*.spec.ts', '**/__tests__/**', 'dist/**', 'demo/**', 'examples/**'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
});
