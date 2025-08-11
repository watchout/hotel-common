#!/bin/bash
# ホテル統合システム アプリケーションデプロイスクリプト

# 引数のチェック
if [ "$#" -lt 1 ]; then
    echo "使用方法: $0 <環境名> [Gitブランチ名]"
    echo "環境名: development, staging, production"
    echo "Gitブランチ名: デフォルトは main"
    exit 1
fi

# 変数の設定
ENV=$1
BRANCH=${2:-main}
APP_DIR="/var/www/hotel-app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_DIR="$APP_DIR/releases/$TIMESTAMP"
CURRENT_LINK="$APP_DIR/current"

# 環境設定ファイルの確認
ENV_FILE="$APP_DIR/.env.$ENV"
if [ ! -f "$ENV_FILE" ]; then
    echo "エラー: 環境設定ファイル $ENV_FILE が見つかりません"
    exit 1
fi

# デプロイディレクトリの作成
echo "デプロイディレクトリを作成中..."
mkdir -p $DEPLOY_DIR

# リポジトリからコードを取得
echo "リポジトリから $BRANCH ブランチのコードを取得中..."
git clone -b $BRANCH --single-branch https://github.com/yourusername/hotel-common.git $DEPLOY_DIR

# 環境設定ファイルのコピー
echo "環境設定ファイルをコピー中..."
cp $ENV_FILE $DEPLOY_DIR/.env

# 依存関係のインストール
echo "依存関係をインストール中..."
cd $DEPLOY_DIR
npm install --production

# TypeScriptのビルド
echo "TypeScriptをビルド中..."
npm run build

# データベースマイグレーション
echo "データベースマイグレーションを実行中..."
npm run migrate

# シンボリックリンクの更新
echo "シンボリックリンクを更新中..."
if [ -L "$CURRENT_LINK" ]; then
    rm $CURRENT_LINK
fi
ln -s $DEPLOY_DIR $CURRENT_LINK

# アプリケーションの再起動
echo "アプリケーションを再起動中..."
cd $CURRENT_LINK
pm2 delete hotel-app || true
pm2 start dist/index.js --name hotel-app

# 古いリリースのクリーンアップ
echo "古いリリースをクリーンアップ中..."
cd $APP_DIR/releases
ls -t | tail -n +6 | xargs rm -rf

echo "デプロイが完了しました"
echo "アプリケーションのステータス:"
pm2 status hotel-app