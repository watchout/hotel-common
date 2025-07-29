# 🏢 ホテルシステム 共有テーブル統合マトリックス

**作成日**: 2025年1月25日  
**統合管理者**: ユーザー（統合管理者）  
**統合アシスタント**: Iza  
**目的**: 各システム設計の体系的照合と共有テーブル明確化

---

## 🚨 **統合管理の基本的失態**

**本来この分析は統合開始前に実施すべきでした。各システム設計の照らし合わせなしに統合を進めることは不可能です。**

---

## 📊 **各システムスキーマ分析結果**

### **🏨 hotel-saas エンティティ（主要84テーブル）**
```yaml
場所管理系:
  - Place (id: Int, code: unique, name, floor, capacity, area)
  - PlaceType (name, description, color, icon)
  - PlaceGroup, PlaceGroupMember

注文・決済系:
  - Order (tenantId, roomId, placeId?, status, items, total)
  - OrderItem (orderId, menuItemId, name, price, quantity)
  - Receipt (placeId, receiptData, totalAmount)

メニュー管理系:
  - MenuItem (tenantId, name, name_ja, price, categoryId)
  - Category (tenantId, name, name_ja, parentId)
  - Tag (tenantId, path, name_ja, name_en)

滞在ゲスト系:
  - Guest (roomStatusId, guestNumber, name?, phone?, email?)
  - RoomStatus (placeId: unique, status, checkinAt, checkoutAt)

デバイス管理系:
  - DeviceRoom (tenantId, roomId?, placeId?, deviceName)
  - DeviceAccessLog

コンテンツ管理系:
  - InfoArticle, InfoTranslation, InfoRevision
  - Layout, LayoutRevision, LayoutAsset

AI・分析系:
  - AiConversation, AiMessage, AiModel
  - AiCreditUsage, AiKnowledgeBase

基盤テーブル:
  - Tenant (id: String/cuid, name, email, planType)
  - User (id: Int, email: unique, password, role)
  - Room, RoomGrade, Reservation, MemberGradeAccess (最下部に追加)
```

### **👥 hotel-member エンティティ（主要8テーブル）**
```yaml
マルチテナント基盤:
  - tenant (id: String/cuid, name, code: unique, domain?)

統一認証基盤:
  - user (id: String/cuid, tenant_id, email, password_hash, role)

顧客管理統一基盤:
  - customer (id: String/cuid, tenant_id, name, email?, phone?, member_id?, rank_id?, total_points)

予約統一管理基盤:
  - reservation (id: String/cuid, tenant_id, customer_id?, guest_name, checkin_date, checkout_date, room_type, status, origin)

客室管理基盤:
  - room (id: String/cuid, tenant_id, room_number, room_type, floor, capacity, status, base_price)

システム監査:
  - system_event (tenant_id, user_id?, event_type, action, entity_type, entity_id)
  - schema_version (version, description, applied_at)
```

### **🏛️ hotel-pms エンティティ（主要77テーブル）**
```yaml
基本的にhotel-saasと同じ構造:
  - Place, PlaceType, PlaceGroup (場所管理) - 同一
  - Order, OrderItem, Receipt (注文・決済) - 同一
  - MenuItem, Category, Tag (メニュー管理) - 同一
  - Guest, RoomStatus (滞在ゲスト) - 同一
  - DeviceRoom, DeviceAccessLog (デバイス管理) - 同一
  - InfoArticle, Layout等 (コンテンツ管理) - 同一
  - AI関連 (AiConversation等) - 同一

基盤テーブル:
  - Tenant (id: String, name, domain?, planType) - hotel-saasと同一
  - User (id: Int, email: unique, password, role) - hotel-saasと同一

運用管理追加:
  - additional_devices, monthly_billings, plan_change_logs
  - referrals, usage_statistics, plan_restrictions
```

---

## 🎯 **共有テーブル統合マトリックス**

### **🔴 CRITICAL重複（即座統合必須）**

#### **1. 基盤テーブル（全システム共通）**
| テーブル | saas | member | pms | 統合方針 | 主管理システム |
|----------|------|--------|-----|----------|--------------|
| **Tenant** | ✅ String/cuid | ✅ String/cuid | ✅ String | ✅ **統一済み** | hotel-common |
| **User** | ✅ Int/auto | ✅ String/cuid | ✅ Int/auto | ⚠️ **ID型不一致** | hotel-common |

#### **2. 場所管理（重複解決必須）**
| 機能 | saas | member | pms | 統合方針 | 推奨解決策 |
|------|------|--------|-----|----------|-----------|
| **客室管理** | Place (Int) | room (String/cuid) | Place (Int) | 🚨 **機能重複** | **Room優先統合** |
| **場所タイプ** | PlaceType | - | PlaceType | ✅ 部分共有 | hotel-saas/pms |

#### **3. 人物管理（3重重複）**
| 人物タイプ | saas | member | pms | 用途 | 統合方針 |
|----------|------|--------|-----|------|----------|
| **スタッフ認証** | User (Int) | user (String) | User (Int) | システム操作権限 | **ID統一必須** |
| **顧客・会員** | - | customer (String) | - | 会員情報・ポイント | **Customer基盤** |
| **滞在ゲスト** | Guest (Int) | - | Guest (Int) | チェックイン中 | **Guest維持** |

#### **4. 予約管理**
| テーブル | saas | member | pms | 統合方針 | 主管理システム |
|----------|------|--------|-----|----------|--------------|
| **Reservation** | ❌ なし | ✅ String/cuid | ❌ なし | ✅ **member基盤** | hotel-member → hotel-pms |

---

### **🟡 MEDIUM重複（段階的統合）**

#### **5. 注文・決済管理**
| テーブル | saas | member | pms | 統合方針 | 主管理システム |
|----------|------|--------|-----|----------|--------------|
| **Order** | ✅ Int | ❌ なし | ✅ Int | ✅ **saas/pms共有** | hotel-saas |
| **OrderItem** | ✅ Int | ❌ なし | ✅ Int | ✅ **saas/pms共有** | hotel-saas |
| **Receipt** | ✅ String/uuid | ❌ なし | ✅ String | ✅ **saas/pms共有** | hotel-saas |

#### **6. メニュー管理**
| テーブル | saas | member | pms | 統合方針 | 主管理システム |
|----------|------|--------|-----|----------|--------------|
| **MenuItem** | ✅ Int | ❌ なし | ✅ Int | ✅ **saas/pms共有** | hotel-saas |
| **Category** | ✅ Int | ❌ なし | ✅ Int | ✅ **saas/pms共有** | hotel-saas |
| **Tag** | ✅ Int | ❌ なし | ✅ Int | ✅ **saas/pms共有** | hotel-saas |

---

### **🟢 LOW重複（独立保持可能）**

#### **7. システム固有機能**
| 機能分野 | saas専用 | member専用 | pms専用 | 統合方針 |
|----------|----------|------------|---------|----------|
| **AI・コンシェルジュ** | AiConversation, AiMessage | - | 同一テーブル | ✅ **saas主管理** |
| **コンテンツ管理** | Layout, InfoArticle | - | 同一テーブル | ✅ **saas主管理** |
| **システム監査** | - | system_event | - | ✅ **member主管理** |
| **請求・運用管理** | - | - | monthly_billings | ✅ **pms主管理** |

---

## 📋 **統合優先順位マトリックス**

### **Phase 1: Critical基盤統合（1週間）**
```yaml
1. User ID型統一:
   課題: saas/pms(Int) vs member(String/cuid)
   解決: String/cuid統一、既存データ移行
   
2. Place/Room統合:
   課題: 同じ客室が別テーブルで管理
   解決: Room基盤統合、Place→Room移行
   
3. RoomStatus整合性:
   課題: RoomStatus.placeId vs Room.id
   解決: RoomStatus.roomId変更
```

### **Phase 2: 業務データ統合（2週間）**
```yaml
4. Customer/Guest関係整理:
   課題: 同一人物の分散管理
   解決: Guest↔Customer紐付けロジック
   
5. Reservation統合:
   課題: member基盤のReservationがpmsで未活用
   解決: hotel-pms予約機能の移行
   
6. Order系統合:
   課題: saas/pms間の注文データ重複リスク
   解決: hotel-saas注文基盤に統一
```

### **Phase 3: システム機能統合（2週間）**
```yaml
7. MenuItem/Category統合:
   課題: saas/pms間の重複メニュー管理
   解決: hotel-saas基盤への統一
   
8. AI・コンテンツ機能:
   課題: saas/pms同一機能の重複実装
   解決: hotel-saas主管理に統一
   
9. 監査・運用機能:
   課題: 分散したログ・請求管理
   解決: 各システム特化機能として保持
```

---

## 🔧 **技術的統合指針**

### **ID型統一方針**
```yaml
統一仕様:
  - 基本: String @id @default(cuid())
  - 例外: 既存システムで変更困難な場合のみInt許可
  - 移行: 段階的変更、データ移行スクリプト必須

実装手順:
  1. 新規テーブルは全てString/cuid
  2. 既存テーブルは影響分析後に段階移行
  3. 外部キー関係の一括調整
```

### **テーブル責任分担**
```yaml
主管理責任:
  hotel-common: Tenant, User, RoomGrade, Room
  hotel-member: Customer, Reservation, SystemEvent
  hotel-saas: Order, MenuItem, AI/Content系
  hotel-pms: 客室運用ステータス、請求管理

更新権限:
  主管理システム: 全フィールド更新可能
  参照システム: 限定フィールドのみ更新
  統合システム: 参照のみ、更新は主管理経由
```

### **データ同期方針**
```yaml
Critical同期 (リアルタイム):
  - OTA予約競合防止
  - 客室在庫状況
  - 注文→請求連携
  - チェックイン/アウト状況

Standard同期 (日次バッチ):
  - 顧客基本情報
  - ポイント・ランク計算
  - 分析・統計データ
```

---

## 📊 **データ移行計画**

### **既存データ影響分析**
```yaml
hotel-saas:
  - Place (0件) → Room移行対象なし
  - User → Customer統合対象なし（スタッフのみ）
  - Order関連 → 継続使用（データ保持）

hotel-member:
  - customer (0件) → 新規作成のみ
  - reservation (0件) → 新規作成のみ
  - room (0件) → 新規作成のみ

hotel-pms:
  - Place → Room統合必要（データ移行）
  - User → ID型変更必要（データ移行）
  - 既存4Room → 継続使用（スキーマ調整のみ）
```

### **移行リスク評価**
```yaml
High Risk:
  - User ID型変更 (認証・外部キー関係)
  - Place→Room統合 (参照関係大量変更)

Medium Risk:
  - RoomStatus.placeId→roomId変更
  - Category/MenuItemの重複排除

Low Risk:
  - 新規テーブル追加
  - 空テーブルのスキーマ変更
```

---

## 🎯 **実行計画**

### **即座実行項目**
1. **全システム担当者への共有**
2. **Phase 1 Critical統合の着手**
3. **データ移行スクリプト作成**
4. **統合テスト環境構築**

### **管理体制強化**
1. **週次統合進捗会議**
2. **システム間調整のリアルタイム対応**
3. **統合後の動作検証プロセス**

---

## 🚨 **統合管理者からの謝罪**

**この分析は統合開始前に実施すべき最も基本的な作業でした。**

**各システムの設計を照らし合わせずに統合を進めることは不可能であり、指摘されてから実施することは統合管理者として完全に失格です。**

**今後は、この体系的分析をベースに予防的・戦略的な統合管理を実行します。** 