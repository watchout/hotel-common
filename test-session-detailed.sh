#!/bin/bash

# 詳細セッション管理APIテストスクリプト
BASE_URL="http://localhost:3400"
TENANT_ID="default"

echo "🧪 詳細セッション管理APIテスト開始"
echo "=================================="

# 1. ヘルスチェック
echo "❤️ 1. ヘルスチェック"
curl -s -X GET "${BASE_URL}/health" | jq '.'
echo -e "\n"

# 2. セッション統計情報取得テスト
echo "📊 2. セッション統計情報取得テスト"
curl -s -X GET "${BASE_URL}/api/v1/session-migration/statistics" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
echo -e "\n"

# 3. 後方互換性チェックテスト
echo "🔄 3. 後方互換性チェックテスト"
curl -s -X GET "${BASE_URL}/api/v1/session-migration/compatibility-check" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
echo -e "\n"

# 4. 移行状況レポート取得
echo "📋 4. 移行状況レポート取得"
curl -s -X GET "${BASE_URL}/api/v1/session-migration/report" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
echo -e "\n"

# 5. 部屋のアクティブセッション取得テスト
echo "🏠 5. 部屋のアクティブセッション取得テスト (room-101)"
curl -s -X GET "${BASE_URL}/api/v1/sessions/active-by-room/room-101" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
echo -e "\n"

# 6. セッション番号による取得テスト
echo "🔢 6. セッション番号による取得テスト (R101-20250828-001)"
curl -s -X GET "${BASE_URL}/api/v1/sessions/by-number/R101-20250828-001" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
echo -e "\n"

# 7. 注文履歴でのセッション情報確認
echo "🍽️ 7. 注文履歴でのセッション情報確認"
curl -s -X GET "${BASE_URL}/api/v1/orders/history?limit=5" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.data.orders[]? | {id, roomId, total, session}' 2>/dev/null || echo "注文データなし"
echo -e "\n"

# 8. 新しい注文作成テスト（セッション自動紐付け）
echo "🆕 8. 新しい注文作成テスト（セッション自動紐付け）"
curl -s -X POST "${BASE_URL}/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" \
  -d '{
    "roomId": "room-101",
    "items": [
      {
        "menuId": "menu-1",
        "name": "テストコーヒー",
        "price": 500,
        "quantity": 2
      }
    ],
    "specialInstructions": "テスト注文",
    "paymentMethod": "room-charge"
  }' | jq '.'
echo -e "\n"

# 9. セッション料金計算テスト
echo "💰 9. セッション料金計算テスト"
SESSION_ID=$(curl -s -X GET "${BASE_URL}/api/v1/sessions/active-by-room/room-101" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq -r '.data.session.id // empty' 2>/dev/null)

if [ ! -z "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
  echo "セッションID: $SESSION_ID"
  curl -s -X GET "${BASE_URL}/api/v1/session-billing/calculate/${SESSION_ID}" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
else
  echo "アクティブセッションが見つかりません"
fi
echo -e "\n"

# 10. チェックインテスト（セッション自動作成）
echo "🏨 10. チェックインテスト（セッション自動作成）"
curl -s -X POST "${BASE_URL}/api/v1/admin/front-desk/checkin" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT_ID}" \
  -d '{
    "roomNumber": "102",
    "guests": [
      {
        "name": "テスト太郎",
        "email": "test@example.com",
        "phone": "090-1234-5678"
      }
    ],
    "guestCount": 1,
    "notes": "APIテスト用チェックイン"
  }' | jq '.'

echo -e "\n"
echo "✅ 詳細セッション管理APIテスト完了"

