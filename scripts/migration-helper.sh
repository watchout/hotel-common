#!/bin/bash

# マイグレーション作成ヘルパースクリプト
# 使用方法: ./scripts/migration-helper.sh "migration_name"

if [ -z "$1" ]; then
  echo "❌ エラー: マイグレーション名を指定してください"
  echo "使用方法: ./scripts/migration-helper.sh \"migration_name\""
  exit 1
fi

MIGRATION_NAME="$1"

echo "🔍 現在のスキーマ状態を確認中..."
npx prisma format

echo "📋 マイグレーションを作成中（dry-run）..."
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script

echo ""
echo "❓ 上記の変更内容で問題ありませんか？ (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
  echo "✅ マイグレーションを作成します..."
  npx prisma migrate dev --name "$MIGRATION_NAME"
  echo "🎉 マイグレーション作成完了!"
else
  echo "❌ マイグレーション作成をキャンセルしました"
  exit 1
fi
