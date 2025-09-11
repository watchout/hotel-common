#!/bin/bash

# 引数からファイルパスと内容を取得
FILE_PATH=$1
CONTENT_FILE=$2

# ディレクトリが存在しない場合は作成
mkdir -p $(dirname "$FILE_PATH")

# ファイルを作成
cat "$CONTENT_FILE" > "$FILE_PATH"

echo "ファイルを作成しました: $FILE_PATH"
