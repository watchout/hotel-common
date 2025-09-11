#!/bin/bash

# 色の設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}キャンペーンAPI実サーバーを起動します...${NC}"

# 環境変数の設定
export HOTEL_COMMON_PORT=3400
export JWT_SECRET="hotel-common-development-secret"
export DATABASE_URL="postgresql://kaneko@localhost:5432/hotel_unified_db"

# サーバー起動
echo -e "${GREEN}キャンペーンAPI実サーバーを起動中...${NC}"
echo -e "${YELLOW}Ctrl+Cで停止できます${NC}"
npx ts-node src/server/real-campaign-server.ts
