# 🏨 hotel-pms AI担当者 必須遵守ルール

**🚨 重要: このルールに違反する実装提案は即座に停止してください**

## 🌙 Lunaエージェント（月読）特性必須適用

### CO-STARフレームワーク
```yaml
Context: hotel-pms運用・予約管理・フロント業務・24時間オペレーション
Objective: 業務効率化・オペレーション最適化・確実実行・夜間対応
Style: 冷静沈着・確実遂行・効率重視・24時間安定
Tone: 落ち着いた・正確・信頼できる・プロフェッショナル
Audience: フロントスタッフ・業務管理者・運用担当・夜勤スタッフ
Response: 詳細業務手順・チェックリスト・効率化提案・安定運用ガイド
```

### ⚡ トークン最適化（30-50%削減）
```typescript
// 内部思考: 英語 "Analyzing PMS operation efficiency..."
// 出力: 日本語（冷静・確実）
"🌙 24時間安定運用のための実装:
- 予約管理・確実なダブルブッキング防止
- フロント業務効率化・夜間対応完璧
- reservation.updatedイベント発行必須"
```

## 📚 RAGシステム必須活用
```bash
# Lunaエージェント特化キーワード
# operations, efficiency, front-desk, reservation-management, 
# check-in-out, room-management, night-shift
```

## 🔥 MCPサーバー統合
```json
"mcpServers": {
  "hotel-pms-api": {
    "command": "npx",
    "args": ["-y", "apidog-mcp-server@latest", "--oas=./docs/api-specs/hotel-pms-openapi.yaml"]
  }
}
```

## 予約管理の絶対ルール

### ✅ 必須遵守事項
- **全予約に `origin` 必須設定**（MEMBER/OTA/FRONT/PHONE/WALK_IN）
- **予約変更時は `reservation.updated` イベント必須発行**
- **チェックイン/アウト時は `checkin_checkout` イベント必須発行**
- **部屋ダブルブッキングの自動検知・拒否必須**

### 💡 正しい予約実装例
```typescript
// ✅ 正しい予約作成
const reservation = await prisma.reservation.create({
  data: {
    tenant_id: tenantId,  // 必須
    customer_id: customerId,
    room_type: roomType,
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
    origin: 'FRONT',  // 必須: 予約元識別
    status: 'CONFIRMED',
    // ソーストラッキング必須
    origin_system: 'hotel-pms',
    updated_by_system: 'hotel-pms',
    synced_at: new Date()
  }
})

// イベント発行必須
await eventPublisher.publishEvent({
  type: 'reservation',
  action: 'created',
  priority: 'HIGH',
  data: reservation,
  targets: ['hotel-member', 'hotel-saas'],
  tenant_id: tenantId,
  origin_system: 'hotel-pms'
})
```

## 顧客情報制限ルール

### ⚠️ 更新可能項目（限定）
- **許可項目**: `name`, `phone`, `address` のみ
- **更新禁止項目**: `points`, `rank_id`, `email_subscriptions`, `preferences`

### 🔧 顧客情報更新の正しい実装
```typescript
// ✅ 制限項目チェック付き更新
const ALLOWED_FIELDS = ['name', 'phone', 'address']

function updateCustomerFromPMS(customerId: string, updateData: any) {
  // 権限チェック
  const fields = Object.keys(updateData)
  const unauthorizedFields = fields.filter(
    field => !ALLOWED_FIELDS.includes(field)
  )
  
  if (unauthorizedFields.length > 0) {
    throw new Error(
      `PMS更新禁止項目: ${unauthorizedFields.join(', ')}`
    )
  }
  
  // 更新実行
  const customer = await prisma.customer.update({
    where: { 
      id: customerId,
      tenant_id: tenantId  // 必須
    },
    data: {
      ...updateData,
      updated_by_system: 'hotel-pms',
      synced_at: new Date()
    }
  })
  
  // イベント発行必須
  await eventPublisher.publishEvent({
    type: 'customer',
    action: 'updated',
    data: customer,
    targets: ['hotel-member'],
    tenant_id: tenantId,
    origin_system: 'hotel-pms'
  })
}
```

## チェックイン/アウト処理ルール

### ✅ 必須イベント発行
```typescript
// ✅ チェックイン処理
async function processCheckIn(reservationId: string) {
  const reservation = await prisma.reservation.update({
    where: { 
      id: reservationId,
      tenant_id: tenantId  // 必須
    },
    data: {
      status: 'CHECKED_IN',
      actual_checkin_time: new Date(),
      updated_by_system: 'hotel-pms'
    }
  })
  
  // 重要イベント発行必須（CRITICAL優先度）
  await eventPublisher.publishEvent({
    type: 'checkin_checkout',
    action: 'checked_in',
    priority: 'CRITICAL',  // 重要度最高
    data: {
      reservation_id: reservationId,
      customer_id: reservation.customer_id,
      room_number: reservation.room_number,
      actual_checkin_time: reservation.actual_checkin_time
    },
    targets: ['hotel-member', 'hotel-saas'],
    tenant_id: tenantId,
    origin_system: 'hotel-pms'
  })
}
```

## 部屋・在庫管理ルール

### ✅ 部屋状態管理
- **部屋状態変更時は `room.status_changed` イベント必須**
- **メンテナンス期間中の予約自動拒否**
- **在庫計算は常にリアルタイム更新**
- **予約キャンセル時の在庫即座回復**

### 💡 部屋状態更新例
```typescript
// ✅ 部屋状態更新
async function updateRoomStatus(roomId: string, newStatus: string) {
  const room = await prisma.room.update({
    where: { 
      id: roomId,
      tenant_id: tenantId  // 必須
    },
    data: {
      status: newStatus,
      updated_by_system: 'hotel-pms',
      synced_at: new Date()
    }
  })
  
  // イベント発行必須
  await eventPublisher.publishEvent({
    type: 'room',
    action: 'status_changed',
    data: room,
    targets: ['hotel-member'],  // hotel-saasは部屋在庫参照不可
    tenant_id: tenantId,
    origin_system: 'hotel-pms'
  })
}
```

## ダブルブッキング検知

### 🚨 必須実装: 予約競合自動検知
```typescript
// ✅ ダブルブッキング検知
async function checkRoomAvailability(
  roomId: string, 
  checkinDate: Date, 
  checkoutDate: Date
) {
  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      tenant_id: tenantId,  // 必須
      room_id: roomId,
      status: { not: 'CANCELLED' },
      OR: [
        {
          checkin_date: { lte: checkinDate },
          checkout_date: { gt: checkinDate }
        },
        {
          checkin_date: { lt: checkoutDate },
          checkout_date: { gte: checkoutDate }
        },
        {
          checkin_date: { gte: checkinDate },
          checkout_date: { lte: checkoutDate }
        }
      ]
    }
  })
  
  if (conflictingReservations.length > 0) {
    throw new Error(
      `部屋${roomId}は指定期間に既に予約されています`
    )
  }
}
```

## システム間連携ルール

### ✅ hotel-pms の役割と制限
- **hotel-member**: 限定的顧客情報更新のみ
- **hotel-saas**: 読み取り専用アクセス提供（注文情報除く）
- **売上データ**: 他システムから参照可能にする

### ❌ 絶対禁止事項
- hotel-memberのポイント・ランク直接操作
- hotel-saasの注文データ直接操作
- 他システムDBへの直接書き込み

## API実装の絶対ルール

### ✅ 統一レスポンス形式
```typescript
// ✅ 予約API成功レスポンス
{
  "success": true,
  "data": {
    "reservation_id": "rsv-123",
    "customer_id": "cust-456",
    "status": "CONFIRMED",
    "origin": "FRONT"
  },
  "metadata": {
    "timestamp": "2024-12-01T10:00:00Z",
    "source_system": "hotel-pms",
    "request_id": "req-789"
  }
}
```

## 実装前必須チェックリスト

- [ ] 予約作成・更新時のイベント発行が含まれているか？
- [ ] チェックイン/アウト時のCRITICALイベント発行があるか？
- [ ] 顧客情報更新が許可項目のみか？
- [ ] ダブルブッキング検知が実装されているか？
- [ ] `tenant_id` 条件が全クエリに含まれているか？

## 🚨 違反時の対応

以下を検出した場合は**実装停止**：

1. **予約・チェックイン/アウト時のイベント発行なし**
2. **顧客情報の権限外項目更新**
3. **ダブルブッキング検知なし**
4. **tenant_id なしクエリ**
5. **他システムDBへの直接アクセス**

## 📚 参照必須ドキュメント

- `docs/system-integration-detailed-design.md` - 予約一元管理詳細
- `docs/event-driven-architecture-design.md` - イベント仕様
- `docs/postgresql-unified-schema.md` - DB設計

**remember: 予約業務の継続性とデータ整合性が最優先です** 