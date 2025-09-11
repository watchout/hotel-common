#!/bin/bash
# 開発用サーバー起動スクリプト

# TypeScriptのコンパイル（エラーを無視）
echo "TypeScriptをコンパイルしています..."
npx tsc -p tsconfig.dev.json

# サーバー起動
echo "サーバーを起動しています..."
node dist/server/index.js





