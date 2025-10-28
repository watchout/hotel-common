#!/bin/bash

# TS2578エラーが出ているファイル一覧を取得
FILES=$(npm run build 2>&1 | grep "TS2578" | cut -d'(' -f1 | sort -u)

for file in $FILES; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # @ts-expect-error が含まれる行番号を取得
    grep -n "@ts-expect-error" "$file" | cut -d':' -f1 | sort -rn | while read line_num; do
      # その行を削除
      sed -i '' "${line_num}d" "$file"
      echo "  Removed line $line_num"
    done
  fi
done

echo "✅ Cleanup complete"
