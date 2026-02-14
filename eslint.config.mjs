import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.vitepress/cache',
      '.vitepress/dist',
      'docs/.vitepress/cache',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist',
      'docs/.vitepress/dist/**',
      'src/js/**',
      'src/scss/**',
      'types/**',
      'www/**',
      'webpack.config.js',
      'index.html',
      'EXAMPLES.md',
      'scripts/build.js',
      'scripts/bundles.js'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
);
