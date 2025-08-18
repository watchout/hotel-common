# ビルドステージ
FROM node:20-alpine AS build

WORKDIR /app

# パッケージインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 実行ステージ
FROM node:20-alpine

WORKDIR /app

# ビルド成果物のコピー
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json /app/
COPY --from=build /app/prisma /app/prisma

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3400

# 本番用の依存関係のみインストール
RUN npm install --production

# Prismaクライアントの生成
RUN npx prisma generate

# ポートの公開
EXPOSE 3400

# ヘルスチェックの設定
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3400/health || exit 1

# アプリケーションの起動
CMD ["node", "dist/main.js"]