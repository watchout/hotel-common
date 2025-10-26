// カスタムルールを読み込む
const prismaAdapterRule = require('./scripts/eslint-rules/prisma-adapter-rule');

module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: false,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // カスタムルール
    // semgrepで強制するためESLintでは無効化（CI: .semgrep.yml 参照）
    'prisma-adapter': 'off',
    
    // TypeScript strictness
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-implicit-any-catch': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

    // Imports
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'off',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-return-await': 'error',
    'no-duplicate-imports': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
    // テスト専用: 品質ルールを緩和（本番コードは対象外）
    {
      files: ['**/test-*.ts', '**/tests/**/*.ts', '**/__tests__/**/*.ts'],
      rules: {
        '@typescript-eslint/no-implicit-any-catch': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
        'import/order': 'off',
      },
    },
  ],
};




