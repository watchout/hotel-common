# 🛡️ Guardrails AI統合ルール

## 📋 開発前必須実行

```bash
# 実際のGuardrails AI検証
node scripts/actual-guardrails-system.js
```

## 🚨 必須チェック項目

### Multi-tenant対応
- 全クエリに`tenant_id`必須
- データベースアクセス時のテナント分離

### Type Safety
- `as any`使用禁止
- 適切な型定義必須

### Error Handling
- `try-catch`でawaitを包囲
- エラーログ記録必須

### Security
- SQLインジェクション防止
- 適切な認証・認可チェック

## 🔧 自動修正提案

Guardrails AIが問題を検出した場合、以下の修正を実行：

1. 型安全性の改善
2. エラーハンドリングの追加
3. セキュリティ強化

---
*本物のGuardrails AIフレームワーク統合済み*
