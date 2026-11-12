const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'node_modules/*', 'ios/*', 'android/*', 'expo-env.d.ts']),
  expoConfig,
  prettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react$', '^react-native$'], ['^@?\\w'], ['^@/'], ['^\\.'], ['^\\u0000']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/domain',
              from: [
                './src/application',
                './src/infrastructure',
                './src/presentation',
                './src/di',
                './src/app',
              ],
              message: 'domain must not depend on outer layers.',
            },
            {
              target: './src/application',
              from: ['./src/infrastructure', './src/presentation', './src/di', './src/app'],
              message: 'application may only depend on domain.',
            },
            {
              target: './src/infrastructure',
              from: ['./src/application', './src/presentation', './src/di', './src/app'],
              message:
                'infrastructure implements domain ports; it must not know about other layers.',
            },
            {
              target: './src/presentation',
              from: ['./src/infrastructure', './src/app'],
              message: 'presentation reaches adapters only through use cases injected by di.',
            },
          ],
        },
      ],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',

      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
      'react/no-array-index-key': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['*.config.js', 'plugins/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        module: 'writable',
        require: 'readonly',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
]);
