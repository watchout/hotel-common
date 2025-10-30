// @ts-check
import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Node環境のグローバルを有効化
  {
    languageOptions: {
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
      }
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'off'
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      // ==========================================
      // 🔴 Critical: パフォーマンス直接影響（error必須）
      // ==========================================
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-func-assign': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'no-cond-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-loss-of-precision': 'error',
      'no-sparse-arrays': 'error',

      // ==========================================
      // 🟡 Important: 間接的影響（warn、_で回避可）
      // ==========================================
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        destructuredArrayIgnorePattern: '^_',
      }],
      'no-duplicate-imports': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',

      // ==========================================
      // 🟢 Code Quality: 品質のみ（warn）
      // ==========================================
      'no-console': ['warn', {
        allow: ['warn', 'error', 'info']
      }],
      'no-debugger': 'error',
      'no-alert': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      // 他設定やインライン指定で参照されることがあるため無効化
      'import/order': 'off',
      'import/export': 'off',
      '@typescript-eslint/ban-types': 'warn',
      'no-empty': 'warn',
      'no-empty-function': 'warn',
      'eqeqeq': ['warn', 'always'],
      'no-eval': 'error',
      // 一旦エラー停止を避ける（段階的に修正する）
      'no-unreachable': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      '.output/**',
      'src/generated/prisma/**',
      'lib/hotel-common/src/database/generated/prisma/**',
      'backups/**',
    ]
  }
)


