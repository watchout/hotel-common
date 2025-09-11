#!/bin/bash

# APIエンドポイント動作確認スクリプト
# 使用方法: ./api-test.sh

# 色の設定
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# JWT認証トークン生成（開発用）
generate_token() {
  echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiQURNSU4iLCJ0ZW5hbnRfaWQiOiJkZWZhdWx0IiwiaGllcmFyY2h5X2NvbnRleHQiOnsib3JnYW5pemF0aW9uX2lkIjoib3JnLTEiLCJsZXZlbCI6MSwicGF0aCI6Im9yZy0xIn0sInBlcm1pc3Npb25zIjpbIkFETUlOX0FMTCJdLCJpYXQiOjE2OTAzNDUyMDAsImV4cCI6MTcyMTg4MTIwMH0.qNgZ1dOTmOIl5xyI5B5RmVVxYjHYZPfQw-5JtP-Pf_A"
}

# サーバーが起動しているか確認
check_server() {
  echo -e "${YELLOW}サーバーの接続状態を確認中...${NC}"
  
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3400/health)
  
  if [ "$response" == "200" ]; then
    echo -e "${GREEN}サーバー接続OK (ステータスコード: $response)${NC}"
    return 0
  else
    echo -e "${RED}サーバー接続エラー (ステータスコード: $response)${NC}"
    echo -e "${YELLOW}サーバーが起動していることを確認してください。${NC}"
    echo -e "コマンド例: npm run start-integration-server"
    return 1
  fi
}

# 管理者API - キャンペーン一覧取得
test_admin_get_campaigns() {
  echo -e "\n${YELLOW}テスト: 管理者API - キャンペーン一覧取得${NC}"
  
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "http://localhost:3400/api/v1/admin/campaigns?page=1&limit=10")
  
  echo "$response"
  
  if [[ "$response" == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ テスト成功: キャンペーン一覧を取得できました${NC}"
  else
    echo -e "${RED}✗ テスト失敗: キャンペーン一覧を取得できませんでした${NC}"
  fi
}

# 管理者API - キャンペーン作成
test_admin_create_campaign() {
  echo -e "\n${YELLOW}テスト: 管理者API - キャンペーン作成${NC}"
  
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -X POST \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{
      "code": "SUMMER2025",
      "name": "夏のキャンペーン",
      "description": "夏の特別セール",
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-08-31T23:59:59.999Z",
      "status": "ACTIVE",
      "displayType": "BANNER",
      "displayPriority": 100,
      "ctaType": "BUTTON",
      "ctaText": "詳細を見る",
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "minOrderAmount": 5000,
      "maxUsageCount": 1000,
      "perUserLimit": 1
    }' \
    "http://localhost:3400/api/v1/admin/campaigns")
  
  echo "$response"
  
  if [[ "$response" == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ テスト成功: キャンペーンを作成できました${NC}"
    # キャンペーンIDを抽出
    campaign_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "作成されたキャンペーンID: $campaign_id"
    echo "$campaign_id" > campaign_id.txt
  else
    echo -e "${RED}✗ テスト失敗: キャンペーンを作成できませんでした${NC}"
  fi
}

# 管理者API - キャンペーン詳細取得
test_admin_get_campaign_detail() {
  echo -e "\n${YELLOW}テスト: 管理者API - キャンペーン詳細取得${NC}"
  
  if [ ! -f campaign_id.txt ]; then
    echo -e "${RED}✗ テスト失敗: キャンペーンIDが見つかりません。先にキャンペーン作成テストを実行してください。${NC}"
    return
  fi
  
  campaign_id=$(cat campaign_id.txt)
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "http://localhost:3400/api/v1/admin/campaigns/$campaign_id")
  
  echo "$response"
  
  if [[ "$response" == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ テスト成功: キャンペーン詳細を取得できました${NC}"
  else
    echo -e "${RED}✗ テスト失敗: キャンペーン詳細を取得できませんでした${NC}"
  fi
}

# 管理者API - キャンペーン更新
test_admin_update_campaign() {
  echo -e "\n${YELLOW}テスト: 管理者API - キャンペーン更新${NC}"
  
  if [ ! -f campaign_id.txt ]; then
    echo -e "${RED}✗ テスト失敗: キャンペーンIDが見つかりません。先にキャンペーン作成テストを実行してください。${NC}"
    return
  fi
  
  campaign_id=$(cat campaign_id.txt)
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -X PUT \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "更新された夏のキャンペーン",
      "description": "更新された説明",
      "displayPriority": 200
    }' \
    "http://localhost:3400/api/v1/admin/campaigns/$campaign_id")
  
  echo "$response"
  
  if [[ "$response" == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ テスト成功: キャンペーンを更新できました${NC}"
  else
    echo -e "${RED}✗ テスト失敗: キャンペーンを更新できませんでした${NC}"
  fi
}

# クライアントAPI - アクティブなキャンペーン一覧取得
test_client_get_active_campaigns() {
  echo -e "\n${YELLOW}テスト: クライアントAPI - アクティブなキャンペーン一覧取得${NC}"
  
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "http://localhost:3400/api/v1/campaigns/active?language=ja")
  
  echo "$response"
  
  if [[ "$response" == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ テスト成功: アクティブなキャンペーン一覧を取得できました${NC}"
  else
    echo -e "${RED}✗ テスト失敗: アクティブなキャンペーン一覧を取得できませんでした${NC}"
  fi
}

# クライアントAPI - カテゴリ別キャンペーン一覧取得
test_client_get_campaigns_by_category() {
  echo -e "\n${YELLOW}テスト: クライアントAPI - カテゴリ別キャンペーン一覧取得${NC}"
  
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "http://localhost:3400/api/v1/campaigns/categories/SEASONAL?language=ja")
  
  echo "$response"
  
  if [[ "$response" == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ テスト成功: カテゴリ別キャンペーン一覧を取得できました${NC}"
  else
    echo -e "${RED}✗ テスト失敗: カテゴリ別キャンペーン一覧を取得できませんでした${NC}"
  fi
}

# 管理者API - キャンペーン削除
test_admin_delete_campaign() {
  echo -e "\n${YELLOW}テスト: 管理者API - キャンペーン削除${NC}"
  
  if [ ! -f campaign_id.txt ]; then
    echo -e "${RED}✗ テスト失敗: キャンペーンIDが見つかりません。先にキャンペーン作成テストを実行してください。${NC}"
    return
  fi
  
  campaign_id=$(cat campaign_id.txt)
  token=$(generate_token)
  response=$(curl -s -w "\nステータスコード: %{http_code}" \
    -X DELETE \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "http://localhost:3400/api/v1/admin/campaigns/$campaign_id")
  
  echo "$response"
  
  if [[ "$response" == *"204"* ]]; then
    echo -e "${GREEN}✓ テスト成功: キャンペーンを削除できました${NC}"
    rm -f campaign_id.txt
  else
    echo -e "${RED}✗ テスト失敗: キャンペーンを削除できませんでした${NC}"
  fi
}

# メイン実行
main() {
  echo -e "${YELLOW}=== キャンペーンAPI動作確認テスト ===${NC}"
  
  # サーバー接続確認
  check_server || exit 1
  
  # 管理者APIテスト
  test_admin_get_campaigns
  test_admin_create_campaign
  test_admin_get_campaign_detail
  test_admin_update_campaign
  
  # クライアントAPIテスト
  test_client_get_active_campaigns
  test_client_get_campaigns_by_category
  
  # 削除テスト
  test_admin_delete_campaign
  
  echo -e "\n${YELLOW}=== テスト完了 ===${NC}"
}

# スクリプト実行
main
