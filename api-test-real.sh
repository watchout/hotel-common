#!/bin/bash

# 色の設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3400"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwicm9sZSI6IkFETUlOIiwidGVuYW50X2lkIjoiZGVmYXVsdCIsImlhdCI6MTcyMjA3MjQwMCwiZXhwIjoxNzIyMTU4ODAwfQ.jNwPJGgLLqO5LiQDOckm7T9iR_INgd5iws_JCkw5XvQ"

echo -e "${YELLOW}キャンペーンAPI実サーバーのテストを開始します...${NC}"

# ヘルスチェック
echo -e "\n${GREEN}ヘルスチェック:${NC}"
curl -s "${API_URL}/health" | jq .

# 管理者API - キャンペーン一覧取得
echo -e "\n${GREEN}管理者API - キャンペーン一覧取得:${NC}"
curl -s -H "Authorization: Bearer ${TOKEN}" "${API_URL}/api/v1/admin/campaigns" | jq .

# 管理者API - キャンペーン作成
echo -e "\n${GREEN}管理者API - キャンペーン作成:${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER2025",
    "name": "夏のキャンペーン",
    "description": "夏の特別セール",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "status": "ACTIVE",
    "displayType": "BANNER",
    "displayPriority": 100,
    "ctaType": "BUTTON",
    "ctaText": "詳細を見る",
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "minOrderAmount": 5000
  }' \
  "${API_URL}/api/v1/admin/campaigns" | jq .

# クライアントAPI - アクティブなキャンペーン一覧取得
echo -e "\n${GREEN}クライアントAPI - アクティブなキャンペーン一覧取得:${NC}"
curl -s -H "Authorization: Bearer ${TOKEN}" "${API_URL}/api/v1/campaigns/active" | jq .

echo -e "\n${YELLOW}テスト完了${NC}"
