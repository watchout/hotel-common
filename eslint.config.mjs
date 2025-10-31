// eslint.config.mjs
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  // ベース
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    linterOptions: {
      // プロジェクト内の inline disable は許容（期限はCIで管理）
      noInlineConfig: false,
      reportUnusedDisableDirectives: 'off',
    },
  },
  // 推奨セット
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // 共通ルール
  {
    plugins: { import: importPlugin },
    rules: {
      // 🔴 Blockers（正確性/安全性直結：差分ファイルでブロック）
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-func-assign': 'error',
      'no-unsafe-negation': 'error',
      'no-cond-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-loss-of-precision': 'error',
      'no-sparse-arrays': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      // 🟡 Warn（レビューで指摘：ブロックしない）
      'no-duplicate-imports': 'warn',
      'prefer-const': 'warn',
      'eqeqeq': ['warn', 'always'],
      // ⚪ Off（生産性優先：文脈で override）
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-empty': 'off',
      'no-empty-function': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'import/order': 'off',
      'import/export': 'off',
    },
  },
  // 本番コードは徐々に厳しく（将来の段階的強化ポイント）
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // テスト・スクリプトは自由度高め
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e.ts', 'scripts/**/*.{ts,tsx,js}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  // 除外
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      '.output/**',
      'coverage/**',
      'src/generated/**',
      'lib/hotel-common/src/database/generated/prisma/**',
      'backups/**',
    ],
  },
)
