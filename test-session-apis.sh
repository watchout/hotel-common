#!/bin/bash

# セッション管理APIテストスクリプト
BASE_URL="http://localhost:3400"
TENANT_ID="default"

echo "🧪 セッション管理APIテスト開始"
echo "=================================="

# 1. セッション統計情報取得テスト
echo "📊 1. セッション統計情報取得テスト"
curl -s -X GET "${BASE_URL}/api/v1/session-migration/statistics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'

echo -e "\n"

# 2. 後方互換性チェックテスト
echo "🔄 2. 後方互換性チェックテスト"
curl -s -X GET "${BASE_URL}/api/v1/session-migration/compatibility-check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'

echo -e "\n"

# 3. セッション一覧取得テスト
echo "📋 3. セッション一覧取得テスト"
curl -s -X GET "${BASE_URL}/api/v1/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'

echo -e "\n"

# 4. 部屋のアクティブセッション取得テスト
echo "🏠 4. 部屋のアクティブセッション取得テスト (room-101)"
curl -s -X GET "${BASE_URL}/api/v1/sessions/active-by-room/room-101" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'

echo -e "\n"

# 5. セッション番号による取得テスト
echo "🔢 5. セッション番号による取得テスト (R101-20250828-001)"
curl -s -X GET "${BASE_URL}/api/v1/sessions/by-number/R101-20250828-001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'

echo -e "\n"

# 6. セッション料金計算テスト
echo "💰 6. セッション料金計算テスト"
SESSION_ID=$(curl -s -X GET "${BASE_URL}/api/v1/sessions/active-by-room/room-101" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq -r '.data.session.id // empty')

if [ ! -z "$SESSION_ID" ]; then
  echo "セッションID: $SESSION_ID"
  curl -s -X GET "${BASE_URL}/api/v1/session-billing/calculate/${SESSION_ID}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -H "X-Tenant-ID: ${TENANT_ID}" | jq '.'
else
  echo "アクティブセッションが見つかりません"
fi

echo -e "\n"

# 7. 注文履歴でのセッション情報確認
echo "🍽️ 7. 注文履歴でのセッション情報確認"
curl -s -X GET "${BASE_URL}/api/v1/orders/history?limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "X-Tenant-ID: ${TENANT_ID}" | jq '.data.orders[] | {id, roomId, total, session}'

echo -e "\n"

echo "✅ セッション管理APIテスト完了"

