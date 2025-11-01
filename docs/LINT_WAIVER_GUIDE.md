# ESLint Waiver（例外）ガイドライン

## 目的

新規コードでは`--max-warnings=0`を要求しますが、やむを得ない場合のみ**期限付き例外（Waiver）**を認めます。

---

## Waiverの必須要件

Waiverには**3つの情報**が必須です：

```typescript
// eslint-disable-next-line <rule-name> -- WAIVER:<TICKET-ID> until:<YYYY-MM-DD> reason:<理由> owner:<担当者>
const problematic = doSomething();
```

### 必須項目

1. **TICKET-ID**: 課題管理チケット番号（Linear/Jira等）
2. **until**: 期限（YYYY-MM-DD形式）
3. **reason**: 理由（1行で簡潔に）
4. **owner**: 担当者（GitHub ID）

---

## 正しい例

### 例1: 外部APIの型定義待ち

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- WAIVER:LIN-123 until:2025-12-31 reason:外部API型定義未完成 owner:@kaneko
const response: any = await fetchLegacyAPI();
```

### 例2: 段階的移行中

```typescript
// eslint-disable-next-line no-console -- WAIVER:LIN-456 until:2026-01-15 reason:logger移行中 owner:@tanaka
console.log('Legacy log format');
```

---

## 間違った例（CI失敗）

### ❌ 理由なし

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const x: any = fetch();
```

### ❌ 期限なし

```typescript
// eslint-disable-next-line no-console -- TODO: あとで直す
console.log('test');
```

### ❌ 担当者不明

```typescript
// eslint-disable-next-line no-console -- 理由: 一時的
console.log('test');
```

---

## Waiver期限チェック

CIで自動的に期限切れをチェックします：

```yaml
# .github/workflows/quality-gate-changed-only.yml
- name: Check expired waivers
  run: |
    TODAY=$(date +%Y-%m-%d)
    EXPIRED=$(grep -RIn --include=\*.{ts,tsx} "WAIVER:.*until:" . | \
      awk -v today="$TODAY" '{ 
        match($0,/until:([0-9-]+)/,a); 
        if (a[1] != "" && a[1] < today) { 
          print $0; fail=1 
        } 
      } END { if (fail) exit 1 }')

    if [ $? -ne 0 ]; then
      echo "❌ Expired waivers found:"
      echo "$EXPIRED"
      exit 1
    fi
```

期限切れのWaiverがあるとCIが失敗します。

---

## Waiverの承認フロー

1. **開発者**: Waiverコメント追加 + PR作成
2. **レビュアー**: Waiver妥当性を確認
3. **CI**: フォーマット・期限をチェック
4. **承認後**: Linear/Jiraにバックログ登録
5. **期限前**: 担当者が修正PRを作成

---

## Waiverの統計確認

```bash
# 現在のWaiver数を確認
grep -R "WAIVER:" --include="*.ts" --include="*.tsx" . | wc -l

# ルール別の集計
grep -R "WAIVER:" --include="*.ts" --include="*.tsx" . | \
  sed 's/.*eslint-disable-next-line \([^ ]*\).*/\1/' | \
  sort | uniq -c | sort -rn

# 期限が近いもの（30日以内）
TODAY=$(date +%Y-%m-%d)
FUTURE=$(date -d "+30 days" +%Y-%m-%d 2>/dev/null || date -v +30d +%Y-%m-%d)
grep -R "WAIVER:" --include="*.ts" --include="*.tsx" . | \
  awk -v today="$TODAY" -v future="$FUTURE" '{
    match($0,/until:([0-9-]+)/,a);
    if (a[1] >= today && a[1] <= future) print $0
  }'
```

---

## よくある質問

### Q1: Waiverを使わずに修正すべきケースは？

**A**: 以下の場合はWaiverではなく、コードを修正してください：

- 簡単に直せる問題（5分以内）
- 設計が明らかに悪い
- セキュリティリスクがある
- パフォーマンス問題がある

### Q2: 期限はどう決める？

**A**: 以下を目安に：

- 外部依存: 現実的な納期（3-6ヶ月）
- 内部リファクタ: 短め（1-3ヶ月）
- 段階的移行: マイルストーン基準

### Q3: 期限を延長したい場合は？

**A**:

1. 理由をチケットに記載
2. Waiver期限を更新
3. レビュー承認を得る

---

## 参考：大手企業の事例

- **Google**: `NOLINT`コメントに理由必須
- **Meta**: `@fb-only`で期限付き例外
- **Airbnb**: `eslint-disable`には必ずチケット番号

hotel-commonでも同様の厳格な運用を実施します。
