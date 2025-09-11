#!/bin/bash

# データベース操作安全性チェックラッパースクリプト
# 
# 使用方法:
# ./db-safety-wrapper.sh "psql -U postgres -c 'SELECT * FROM users'"

# 色の定義
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -eq 0 ]; then
  echo -e "${RED}エラー: コマンドが指定されていません${NC}"
  echo "使用法: $0 \"実行するコマンド\""
  exit 1
fi

COMMAND="$*"

# 危険なデータベース操作パターン
DANGEROUS_PATTERNS=(
  "psql[[:space:]]+(?!-c[[:space:]]+[\"']SELECT)"
  "CREATE[[:space:]]+TABLE"
  "ALTER[[:space:]]+TABLE"
  "DROP[[:space:]]+TABLE"
  "INSERT[[:space:]]+INTO"
  "UPDATE[[:space:]]+(?!.*WHERE)"
  "DELETE[[:space:]]+FROM[[:space:]]+(?!.*WHERE)"
  "TRUNCATE"
  "pg_dump"
  "pg_restore"
)

# 安全なパターン
SAFE_PATTERNS=(
  "psql[[:space:]]-c[[:space:]]+[\"']SELECT"
  "\\\\d"
  "\\\\l"
)

# 危険なコマンドかどうかチェック
is_dangerous=false

# 安全なパターンに一致するかチェック
for pattern in "${SAFE_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -E -q "$pattern"; then
    is_dangerous=false
    break
  fi
done

# 危険なパターンに一致するかチェック
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -E -q "$pattern"; then
    is_dangerous=true
    break
  fi
done

# 危険なコマンドの場合は確認
if [ "$is_dangerous" = true ]; then
  echo -e "${YELLOW}⚠️  危険なデータベース操作が検出されました:${NC}"
  echo
  echo "$COMMAND"
  echo
  echo "このコマンドはデータベースの整合性を損なう可能性があります。"
  echo "Prismaを使用した安全な操作方法を検討してください。"
  echo
  read -p "それでも実行しますか？ [y/N]: " confirm
  
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 操作はキャンセルされました。${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}⚠️  危険な操作を実行します...${NC}"
fi

# コマンド実行
echo -e "${GREEN}実行中: $COMMAND${NC}"
eval "$COMMAND"

# 終了コードを保持
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo -e "${GREEN}✅ コマンドは正常に完了しました${NC}"
else
  echo -e "${RED}❌ コマンドは失敗しました (終了コード: $exit_code)${NC}"
fi

exit $exit_code
