# 🧠 RAG Knowledge Base 基盤構築

**構築開始**: 2025年1月23日  
**目的**: ハルシネーション問題根絶・正確な情報参照システム  
**Phase**: 緊急実装Phase 1

---

## 📊 **Prismaスキーマ正確情報登録**

### **🎯 データベーススキーマ確定情報**
```yaml
正式データベース名: hotel_unified_db
廃止データベース名: hotel_common_dev (削除済み)
ユーザー名: kaneko
統一ポート構成:
  - hotel-saas: 3100
  - hotel-member: 3200+8080  
  - hotel-pms-browser: 3300
  - hotel-pms-electron: 3301
  - hotel-common: 3400
```

### **✅ 確定型定義・命名規則**
```yaml
Prisma Model正式名:
  ✅ customers (NOT customer)
  ✅ Reservation (PascalCase)
  ✅ Room (PascalCase)
  ✅ Staff (NOT User - 移行完了)
  ✅ Tenant (PascalCase)
  ✅ SystemEvent (NOT system_event)

フィールド命名規則:
  ✅ camelCase: tenantId, checkinDate, confirmationCode
  ❌ snake_case: tenant_id, checkin_date, confirmation_code

必須フィールド存在確認:
  ✅ tenantId (全主要テーブル)
  ✅ id, createdAt, updatedAt (標準フィールド)
  ✅ deletedAt (論理削除対応)
```

### **⚠️ 非存在プロパティ（生成禁止）**
```yaml
Reservation関連:
  ❌ customer (存在しない)
  ❌ checkin_date (正: checkinDate)
  ❌ confirmation_code (正: confirmationCode)

SystemEvent関連:
  ❌ tenant_id (正: tenantId)
  ❌ user_id (正: staffId - User→Staff移行済み)
  ❌ event_type (正: eventType)

Redis関連:
  ❌ first-entry (正: firstEntry)
  ❌ last-entry (正: lastEntry)
  ❌ count プロパティ (特定APIで未対応)
```

---

## 🔧 **TypeScriptエラーパターン・テンプレート**

### **🎯 確実な解決パターン**
```yaml
型キャスト統一パターン:
  ✅ catch (error: unknown) {
       const errorObj = error instanceof Error ? error : new Error(String(error));
       logger.error('エラー詳細', { error: errorObj });
     }

LogEntry型拡張必須:
  ✅ version?: string
  ✅ results?: any  
  ✅ eventType?: string
  ✅ organizationId?: string

Prisma型インポート標準:
  ✅ import { Tenant, Staff, customers, Reservation, Room } from '@prisma/client'
  ❌ import { tenant, staff, customer } from '@prisma/client'
```

### **🚨 絶対禁止パターン**
```yaml
型安全性回避:
  ❌ as any の多用
  ❌ @ts-ignore の使用
  ❌ unknown型のそのまま使用

セキュリティ軽視:
  ❌ 入力検証の省略
  ❌ エラーハンドリングの省略
  ❌ 認証・認可チェックの簡略化

非標準実装:
  ❌ 直接SQL実行（ORM使用必須）
  ❌ 平文パスワード保存
  ❌ tenant_id無しでのデータアクセス
```

---

## 🛡️ **重要制約・ルール（忘却防止）**

### **🔥 絶対遵守事項**
```yaml
マルチテナント対応:
  ✅ 全クエリにtenantId必須
  ✅ データ分離の完全確保
  ✅ 越境アクセス禁止

統合システムルール:
  ✅ hotel-saasはCRUD参照のみ（予約更新禁止）
  ✅ hotel-pmsが予約管理の正本
  ✅ hotel-memberが顧客マスタの正本
  ✅ Event-driven連携必須

認証・セキュリティ:
  ✅ JWT統一認証基盤
  ✅ 階層的権限管理
  ✅ すべてのAPI endpointで認証必須
```

### **📋 hotel業界特有要件**
```yaml
運用要件:
  ✅ 24時間運用対応
  ✅ オフライン動作対応（PMS・SaaS）
  ✅ リアルタイム在庫・予約同期

データ整合性:
  ✅ ダブルブッキング絶対禁止
  ✅ 決済データの完全性確保
  ✅ 顧客個人情報の適切な保護

パフォーマンス:
  ✅ チェックイン/アウト処理 < 3秒
  ✅ 在庫検索 < 1秒
  ✅ レポート生成 < 30秒
```

---

## 🎯 **自動検証システム実装**

### **Phase 1: 基本チェック機能**
```yaml
スキーマ整合性チェック:
  1. 生成プロパティ vs 実際のPrismaスキーマ照合
  2. 存在しないフィールド参照の検出
  3. 型定義不整合の自動警告

命名規則チェック:
  1. snake_case vs camelCase混在検出
  2. 標準命名パターンへの自動提案
  3. 非推奨パターンの即座警告

必須要件チェック:
  1. tenantId漏れ検出
  2. エラーハンドリング存在確認  
  3. セキュリティ要件充足確認
```

### **Phase 2: 高度検証機能**
```yaml
信頼スコア実装:
  1. 生成内容の確実性評価（0-100%）
  2. 低確実性時の手動確認促進
  3. 高リスク変更の事前警告

パターン学習機能:
  1. 成功パターンの蓄積・再利用
  2. エラーパターンの学習・予防
  3. hotel-common特化最適化
```

---

## ⚡ **即座実行リスト**

### **🔥 今すぐ実行（15分以内）**
```yaml
✅ Knowledge Base基盤文書作成
⏳ LogEntry型定義拡張実装
⏳ 型キャスト統一ユーティリティ作成
⏳ 基本検証機能プロトタイプ
```

### **⭐ 次段階実行（60分以内）**
```yaml
⏳ Prismaスキーマ整合性チェック実装
⏳ 命名規則自動修正スクリプト
⏳ 重要制約の定期再プロンプト機能
⏳ エラーパターン分類・学習システム
```

---

## 📊 **基盤構築進捗**

### **✅ 完了項目**
- [x] 正確な仕様・制約の構造化記録
- [x] エラーパターンの分類・テンプレート化
- [x] 自動検証システム設計
- [x] 実装優先順位の決定

### **🔄 実装中項目**
- [ ] LogEntry型定義拡張
- [ ] 型キャスト統一ユーティリティ
- [ ] 基本検証機能
- [ ] Prismaスキーマ整合性チェック

---

**🎯 文献1の知見を基に、ハルシネーション・忘却問題の根本解決基盤が構築されます！**

**最終更新**: 2025年1月23日  
**次回更新**: Phase 1実装完了後 