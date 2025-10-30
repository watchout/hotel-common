# 🔧 hotel-common CI修正・品質管理完全構築 実装プロンプト

## 📋 概要

- 目的: hotel-saasで構築した品質管理体制をhotel-commonへ横展開
- 対象システム: hotel-common
- 工数見積もり: 2-3時間
- 前提条件: hotel-saas PR #10の設定を参照可能

---

## 🎯 実装ゴール

1. ✅ ESLintエラー0件達成（CI通過可能）
2. ✅ ESLintルール最適化（産業標準ベース、パフォーマンス影響0%）
3. ✅ pre-commitフック実装（husky + lint-staged + prettier）
4. ✅ CI成功（GitHub Actions通過）

---

## 📚 必読ドキュメント（重要度順）

### ★★★ 最優先（実装前に必読）

1. hotel-saasの実装結果
   - `/Users/kaneko/hotel-saas/.github/workflows/ci.yml`
   - `/Users/kaneko/hotel-saas/.github/workflows/quality-gate.yml`
   - `/Users/kaneko/hotel-saas/eslint.config.mjs`
   - `/Users/kaneko/hotel-saas/.eslintignore`
   - `/Users/kaneko/hotel-saas/.prettierignore`
   - `/Users/kaneko/hotel-saas/.lintstagedrc.js`
   - `/Users/kaneko/hotel-saas/package.json`（lint-staged設定、prepare script）

2. 品質管理標準
   - `/Users/kaneko/hotel-kanri/docs/standards/DATABASE_NAMING_STANDARD.md`
   - `/Users/kaneko/hotel-kanri/docs/03_ssot/00_foundation/SSOT_PRODUCTION_PARITY_RULES.md`

---

## 🚀 実装手順（Phase別）

### Phase 1: ESLint設定最適化

#### Step 1-1: 現在地確認

```bash
cd /Users/kaneko/hotel-common
pwd
# 期待値: /Users/kaneko/hotel-common
```

#### Step 1-2: hotel-saasのESLint設定を参照

```bash
# hotel-saasの設定を確認
cat /Users/kaneko/hotel-saas/eslint.config.mjs
```

#### Step 1-3: hotel-commonに同様の設定を作成

ファイル: `/Users/kaneko/hotel-common/eslint.config.mjs`

内容: hotel-saasの`eslint.config.mjs`をベースに、以下を調整：

```javascript
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // === Critical Rules (Error) ===
      // パフォーマンス・セキュリティに直接影響
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-func-assign': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'no-cond-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-loss-of-precision': 'error',
      'no-sparse-arrays': 'error',

      // === Important Rules (Warn) ===
      // 品質向上だがCI非ブロック
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-duplicate-imports': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      'no-debugger': 'error',
      'no-alert': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-types': 'warn',
      'no-empty': 'warn',
      'no-empty-function': 'warn',
      eqeqeq: ['warn', 'always'],
      'no-eval': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      // Prisma自動生成ファイル（hotel-commonの実態に合わせる）
      'src/generated/prisma/**',
      'backups/**',
    ],
  }
);
```

#### Step 1-4: .eslintignoreを作成

ファイル: `/Users/kaneko/hotel-common/.eslintignore`

```
dist
node_modules
coverage

# Prisma自動生成ファイル（ESLint除外）
src/generated/prisma/**
node_modules/@prisma/client/**

# 自動生成ファイル
build/**

# バックアップディレクトリ
backups/**
backup/**
```

#### Step 1-5: .prettierignoreを作成

ファイル: `/Users/kaneko/hotel-common/.prettierignore`

```
# Backup directories
backup/**
backups/**

# Auto-generated files
dist/**
build/**
node_modules/**
src/generated/prisma/**
```

#### Step 1-6: 依存関係インストール

```bash
cd /Users/kaneko/hotel-common

# ESLint関連（既にあれば不要）
npm install --save-dev @eslint/js typescript-eslint globals
```

#### Step 1-7: Lint実行・確認

```bash
npm run lint 2>&1 | tee lint-before.log

# エラー数を確認
npm run lint 2>&1 | grep "problems"
```

期待結果: `✖ X problems (0 errors, Y warnings)`

---

### Phase 2: エラー解消（エラーがある場合）

#### Step 2-1: エラー種別を確認

```bash
npm run lint 2>&1 | grep "error" | head -20
```

#### Step 2-2: 自動修正を試行

```bash
npm run lint -- --fix
```

#### Step 2-3: 残存エラーを確認

```bash
npm run lint 2>&1 | grep "error" | wc -l
```

目標: `0 errors`

#### Step 2-4: 手動修正（エラーが残る場合）

hotel-saasで対応したパターンを参考に修正：

1. no-redeclare: import削除（自動インポート活用）
2. route-check: `index.ts`削除（Nuxt 3 / Nitro制約）
3. TypeScript型エラー: `tenant_id` → `tenantId`等

---

### Phase 3: pre-commitフック実装

#### Step 3-1: 依存関係インストール

```bash
cd /Users/kaneko/hotel-common

npm install --save-dev husky lint-staged prettier
```

#### Step 3-2: Huskyセットアップ

```bash
npx husky install
```

#### Step 3-3: package.json更新

ファイル: `/Users/kaneko/hotel-common/package.json`

追加する内容:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

注意: 既存のscriptsセクションに`prepare`スクリプトを追加

#### Step 3-4: .lintstagedrc.js作成

ファイル: `/Users/kaneko/hotel-common/.lintstagedrc.js`

```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    // backup, backups で始まるファイルを除外
    const filtered = filenames.filter((f) => !f.startsWith('backup/') && !f.startsWith('backups/'));

    if (filtered.length === 0) return [];

    return [`eslint --fix ${filtered.join(' ')}`, `eslint --max-warnings=50 ${filtered.join(' ')}`];
  },
  '*.{json,md,yml,yaml}': (filenames) => {
    // backup, backups で始まるファイルを除外
    const filtered = filenames.filter((f) => !f.startsWith('backup/') && !f.startsWith('backups/'));

    if (filtered.length === 0) return [];

    return `prettier --write ${filtered.join(' ')}`;
  },
};
```

#### Step 3-5: pre-commitフック作成

```bash
cd /Users/kaneko/hotel-common
npx husky add .husky/pre-commit "npx lint-staged"
```

#### Step 3-6: .prettierrc作成

ファイル: `/Users/kaneko/hotel-common/.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

#### Step 3-7: pre-commitフック動作確認

```bash
# 設定ファイルのみコミット（動作確認）
git add .eslintignore .prettierignore eslint.config.mjs .lintstagedrc.js .prettierrc package.json
git commit -m "chore(ci): setup ESLint, Prettier, and pre-commit hooks"
```

期待動作:

- lint-stagedが実行される
- エラー0件でコミット成功
- 警告<=50件

---

### Phase 4: CI設定調整

#### Step 4-1: 現在のCI設定を確認

```bash
cat /Users/kaneko/hotel-common/.github/workflows/*.yml
```

#### Step 4-2: quality-gate.yml修正（`--max-warnings=0`削除）

ファイル: `/Users/kaneko/hotel-common/.github/workflows/quality-gate.yml`

修正内容:

```yaml
# Before（もし存在すれば）
- name: Lint
  run: npx eslint . --ext .ts,.tsx --max-warnings=0

# After
- name: Lint
  run: npx eslint . --ext .ts,.tsx
  # 警告はブロックせず、annotationsで可視化
  # 段階的改善の方針（QOS v1準拠）
```

#### Step 4-3: ci.yml確認（testステップ）

ファイル: `/Users/kaneko/hotel-common/.github/workflows/ci.yml`

testステップで`vitest not found`等のエラーがある場合は一時的にスキップ：

```yaml
- run: pnpm run lint
# TODO: Re-enable tests after fixing test setup
# - run: pnpm run test
```

#### Step 4-4: 修正をコミット

```bash
git add .github/workflows/
git commit -m "ci: remove --max-warnings=0 to allow gradual improvement"
git push
```

---

### Phase 5: CI結果確認

#### Step 5-1: CI実行を待機

```bash
cd /Users/kaneko/hotel-common
gh run list --limit 1
```

#### Step 5-2: CI結果確認

```bash
# 最新のrun IDを取得
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')

# CI監視
gh run watch $RUN_ID --exit-status
```

期待結果: ✅ CI Success

#### Step 5-3: エラーがある場合の対処

```bash
# 失敗ログを確認
gh run view $RUN_ID --log-failed 2>&1 | head -100
```

対処方法:

1. エラー内容を確認
2. Phase 2に戻って修正
3. 再度コミット・プッシュ

---

## ✅ 完了確認チェックリスト

### Phase 1: ESLint設定

- [ ] `eslint.config.mjs`作成完了
- [ ] `.eslintignore`作成完了
- [ ] `.prettierignore`作成完了
- [ ] `npm run lint`でエラー0件

### Phase 2: エラー解消

- [ ] エラー数: 0件
- [ ] 警告数: 記録（\_\_件）
- [ ] ビルド成功

### Phase 3: pre-commitフック

- [ ] `husky`インストール完了
- [ ] `.husky/pre-commit`作成完了
- [ ] `.lintstagedrc.js`作成完了
- [ ] `.prettierrc`作成完了
- [ ] `package.json`にprepareスクリプト追加
- [ ] pre-commitフック動作確認（コミット時に自動実行）

### Phase 4: CI設定

- [ ] `quality-gate.yml`修正完了（`--max-warnings=0`削除）
- [ ] `ci.yml`確認完了
- [ ] 修正コミット・プッシュ完了

### Phase 5: CI結果

- [ ] CI実行確認
- [ ] CI成功（✅ Success）
- [ ] エラー0件、警告のみ

---

## 📊 実装後の報告フォーマット

```markdown
✅ hotel-common CI修正・品質管理構築完了

## 対象システム

- hotel-common: ✅ 完了

## Task 1: ESLintルール最適化

- 産業標準ベースへ最適化適用（Airbnb/Google/Facebook観点）
- パフォーマンス影響ルールはerror維持
- パフォーマンス影響: 0%

## Task 2: エラー解消

- エラー: [修正前]件 → 0件 ✅
- 警告: [修正前]件 → [修正後]件
- pre-commit許容: 警告<=50/commit（段階的削減）

## Task 3: pre-commitフック

- husky + lint-staged 実装完了
- `--max-warnings=50` で段階的改善を許容
- prettier適用・設定ファイルコミット検証済み

## 最終状態

- ✅ ローカルpre-commit動作: OK
- ✅ エラー 0件
- ⚠️ 警告 [X]件（段階的削減運用: <=50/commit）
- ✅ CI: Success

## CI結果URL

[Run ID]: https://github.com/watchout/hotel-common/actions/runs/XXXXXXXX

## 作業時間

- [X]時間
```

---

## 🚨 トラブルシューティング

### 問題1: `npm run lint`がコマンド不明

対処:

```bash
# package.jsonにlintスクリプトを追加
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 問題2: TypeScript型エラーが大量

対処:

1. Prisma生成ファイルが原因か確認
   ```bash
   npm run lint 2>&1 | grep "src/generated/prisma"
   ```
2. 該当ディレクトリを`.eslintignore`に追加

### 問題3: pre-commitフックが動かない

対処:

```bash
# huskyを再初期化
rm -rf .husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
chmod +x .husky/pre-commit
```

### 問題4: CI失敗（vitest not found等）

対処:

```yaml
# ci.ymlでtestを一時的にスキップ
- run: npm run lint
# TODO: Re-enable tests after fixing test setup
# - run: npm run test
```

---

## 📝 注意事項

### ❌ 絶対禁止

1. `--no-verify`でコミット（pre-commitフックをスキップ）
   - 例外: 設定ファイルの初回コミットのみ許可

2. エラーをwarnに変更して誤魔化す
   - Critical Rulesはerrorのまま維持

3. backupディレクトリを削除
   - `.eslintignore`で除外するのみ

### ✅ 推奨事項

1. hotel-saasの設定を可能な限り流用
   - 両システムで統一した品質基準

2. 段階的改善を許容
   - 警告は<=50/commitで段階的削減

3. CI結果を必ず確認
   - エラー0件を確保

---

このプロンプトに従って、hotel-commonのCI修正を完了してください！ 🚀
