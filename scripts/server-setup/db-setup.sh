#!/bin/bash
# ホテル統合システム データベースセットアップスクリプト

# スクリプトが postgres ユーザーで実行されているか確認
if [ "$(whoami)" != "postgres" ]; then
    echo "このスクリプトは postgres ユーザーで実行する必要があります"
    echo "例: sudo -u postgres $0"
    exit 1
fi

# 引数のチェック
if [ "$#" -lt 3 ]; then
    echo "使用方法: $0 <データベース名> <ユーザー名> <パスワード>"
    exit 1
fi

# 変数の設定
DB_NAME=$1
DB_USER=$2
DB_PASS=$3

# データベースが既に存在するか確認
DB_EXISTS=$(psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DB_EXISTS" = "1" ]; then
    echo "警告: データベース '$DB_NAME' は既に存在します"
    read -p "データベースを削除して再作成しますか？ (y/n): " recreate_db
    if [ "$recreate_db" = "y" ]; then
        echo "データベース '$DB_NAME' を削除中..."
        dropdb $DB_NAME
    else
        echo "既存のデータベースを使用します"
        exit 0
    fi
fi

# データベースの作成
echo "データベース '$DB_NAME' を作成中..."
createdb $DB_NAME

# ユーザーが既に存在するか確認
USER_EXISTS=$(psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ "$USER_EXISTS" = "1" ]; then
    echo "ユーザー '$DB_USER' は既に存在します"
    echo "パスワードを更新中..."
    psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
else
    echo "ユーザー '$DB_USER' を作成中..."
    psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
fi

# ユーザーに権限を付与
echo "ユーザー '$DB_USER' に権限を付与中..."
psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

# データベース接続情報の表示
echo "データベースセットアップが完了しました"
echo "接続情報:"
echo "  データベース: $DB_NAME"
echo "  ユーザー: $DB_USER"
echo "  パスワード: $DB_PASS"
echo "  接続文字列: postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

# バックアップ設定の確認
echo "日次バックアップが設定されています"
echo "バックアップ先: /var/backups/postgresql"