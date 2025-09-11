#!/bin/bash

echo "デバイスAPI テスト開始"
echo "======================="

# サーバーが起動しているか確認
echo "サーバー接続確認中..."
curl -s http://localhost:3400/health > /dev/null
if [ $? -ne 0 ]; then
  echo "エラー: サーバーに接続できません。サーバーが起動しているか確認してください。"
  exit 1
fi
echo "サーバー接続確認完了"
echo ""

# デバイスステータス確認API テスト
echo "1. デバイスステータス確認API テスト"
echo "-----------------------------"
echo "リクエスト: POST /api/v1/devices/check-status"
curl -s -X POST http://localhost:3400/api/v1/devices/check-status \
  -H "Content-Type: application/json" \
  -d '{"macAddress":"AA:BB:CC:DD:EE:FF","ipAddress":"127.0.0.1","userAgent":"Mozilla/5.0","pagePath":"/order"}' | jq
echo ""

# クライアントIP取得API テスト
echo "2. クライアントIP取得API テスト"
echo "-------------------------"
echo "リクエスト: GET /api/v1/devices/client-ip"
curl -s -X GET http://localhost:3400/api/v1/devices/client-ip | jq
echo ""

# デバイス数取得API テスト（認証が必要）
echo "3. デバイス数取得API テスト"
echo "----------------------"
echo "リクエスト: GET /api/v1/devices/count (認証あり)"
curl -s -X GET http://localhost:3400/api/v1/devices/count \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdC11c2VyIiwidGVuYW50X2lkIjoiZGVmYXVsdCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkzMDAwMDAwLCJleHAiOjE3MjQ1MzYwMDB9.iFBqrYGzRiJkwwgX6JYBcnlvj0n8fGRvWnzQbgJbYy4" | jq
echo ""

echo "デバイスAPI テスト完了"


