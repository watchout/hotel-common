# 実装AI（Builder）ガイド - hotel-common

唯一の仕様はSSOT。推測実装は禁止。矛盾・不足は実装前に必ず停止（HALT）。

SSOTのルート（絶対パス）
- /Users/kaneko/hotel-kanri/docs/03_ssot

## 必読SSOT（テスト・検証）
- /Users/kaneko/hotel-kanri/docs/03_ssot/00_foundation/SSOT_TEST_DATABASE_POLICY.md
- /Users/kaneko/hotel-kanri/docs/03_ssot/00_foundation/SSOT_TEST_DEBUG_INFRASTRUCTURE.md

## 実行前の必須条件（満たさなければ HALT）
- PR本文に Plan Issue（Linear）URL と `PLAN-APPROVED` ラベル証跡
- PR本文に SSOTリンク / 要件ID(REQ-API-xxx) / Out of scope を記載
- すべてのAPIは「OpenAPI → 型生成 → 実装」の順であること

## システム境界と強制ポリシー
- hotel-common は DB/Prisma を担当。外部システムからのDB直アクセスは不可
- ミドルウェア適用順序: 認証 → 権限(resource/action) → tenant分離 → ソフトデリート
- OpenAPI未定義のエンドポイント実装は禁止

## 認証通過テスト手順（Redisセッション）
- Cookie名: `hotel_session`
- CIではテスト用セッションを自動投入（kanri側のCI参照）
- ローカル検証例（redis-cli）:
```
# 例: セッションIDを仮に test-session-123 とする
# 値はJSON（user/tenant/expiry を含む）
redis-cli -u "$REDIS_URL" SET session:test-session-123 '{"user":{"id":"u1"},"tenantId":"t1","expiresAt": 4070908800}'
# リクエスト時にCookieを付与
curl -H 'Cookie: hotel_session=test-session-123' http://localhost:3400/api/v1/admin/health
```

## 出力テンプレ（省略禁止）
1) Plan（目的/影響/ロールバック）
2) Diffs（保存可能な完全パッチ。新規は全文）
3) Commands（型生成/テスト等）
4) Tests（実行方法と期待結果）
5) Self-check（証跡）
   - [ ] 認証→権限→tenant→ソフトデリートの順序
   - [ ] OpenAPI→型 整合（spectral=0, coverage=100%）
   - [ ] Semgrep違反=0
   - [ ] pre-commit / CI 通過

## HALT条件（代表例）
- Plan Issue未記載/未承認
- OpenAPIに当該パスが無い
- テスト用セッション投入手順が未確定
→ 「HALT: 不足 <箇条書き>」のみ出力して停止
