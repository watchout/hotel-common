# Hotel Common - 統合基盤ライブラリ

ホテル管理システム群（hotel-saas、hotel-member、hotel-pms）の統合を支える共通ライブラリです。

## 🏗️ 概要

Hotel Commonは以下の機能を提供する統合基盤です：

- **統一JWT認証基盤** - 全システム共通の認証・認可システム
- **API連携ライブラリ** - 型安全なシステム間通信
- **WebSocket通信基盤** - リアルタイム通信とEvent-driven連携
- **Redis連携** - セッション管理とキャッシュ機能
- **統一ログ機能** - 構造化ログとマルチ出力対応
- **バリデーション機能** - 統一されたデータ検証

## 📦 システム構成

```
Hotel Management System
├── hotel-saas (Port: 3100)     - AI Concierge
├── hotel-member (Port: 3200)   - AI Customer Management  
├── hotel-pms (Port: 3300)      - AI Hotel Management
└── hotel-common (Port: 3400)   - Integration Foundation
```

## 🚀 インストール

```bash
npm install hotel-common
```

## 🔧 環境設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

必要な環境変数を設定してください。

## 📖 使用方法

### JWT認証

```typescript
import { JwtManager } from 'hotel-common'

// トークン生成
const tokens = JwtManager.generateTokenPair({
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  tenant_id: '987fcdeb-51d2-4567-890a-123456789abc',
  email: 'user@example.com',
  role: 'admin',
  level: 5,
  permissions: ['read', 'write', 'admin']
})

// トークン検証
const payload = JwtManager.verifyAccessToken(tokens.accessToken)
```

### APIクライアント

```typescript
import { HotelApiClientFactory } from 'hotel-common'

// hotel-member APIクライアント作成
const memberClient = HotelApiClientFactory.createMemberClient({
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
})

// API呼び出し
const response = await memberClient.get('/customers', { page: 1, limit: 10 })
if (response.success) {
  console.log(response.data)
}
```

### WebSocket通信

```typescript
import { HotelWebSocketFactory } from 'hotel-common'

// WebSocketクライアント作成
const wsClient = HotelWebSocketFactory.createCommonClient({
  tenantId: 'your-tenant-id',
  userId: 'your-user-id',
  authToken: 'your-jwt-token'
})

// イベントリスナー登録
wsClient.on('system:event', (event) => {
  console.log('System event received:', event)
})

// システムイベント送信
wsClient.sendSystemEvent({
  type: 'reservation.created',
  source: 'hotel-member',
  target: 'hotel-pms',
  tenant_id: 'your-tenant-id',
  data: { reservation_id: '123' }
})
```

### Redis連携

```typescript
import { getRedisClient } from 'hotel-common'

const redis = getRedisClient()

// セッション管理
await redis.saveSession(sessionInfo)
const session = await redis.getSession(tenantId, userId)

// キャッシュ機能
await redis.setCache('user:123', userData, 3600) // 1時間TTL
const cached = await redis.getCache('user:123')
```

### ログ機能

```typescript
import { logger } from 'hotel-common'

// 基本ログ
await logger.info('User authenticated', {
  userId: 'user-123',
  tenantId: 'tenant-456'
})

// 認証ログ
await logger.auth('Login successful', userId, tenantId, requestId)

// APIログ  
await logger.api('API request', 'POST', '/api/reservations', 201, requestId)

// エラーログ
await logger.error('Database connection failed', {
  error: new Error('Connection timeout')
})
```

### バリデーション

```typescript
import { HotelValidator, CommonValidationRules } from 'hotel-common'

const rules = [
  CommonValidationRules.email,
  CommonValidationRules.tenantId,
  {
    field: 'name',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50
  }
]

const result = HotelValidator.validate(requestData, rules)
if (!result.isValid) {
  const apiError = HotelValidator.toApiError(result)
  throw apiError
}
```

## 🏛️ アーキテクチャ

### 統一認証フロー
1. **ログイン** → JWT（8時間）+ Refresh Token（30日）発行
2. **API呼び出し** → JWT検証 + Redis セッション確認
3. **自動更新** → Refresh Token使用してJWT再発行

### Event-driven連携
- **リアルタイム同期**: 予約情報、チェックイン/アウト、顧客基本情報
- **バッチ同期**: 売上集計、分析、レポート
- **障害対応**: ローカルキャッシュ + 復旧後差分同期

### データ保護
- **Level 1 (開発)**: 3段階確認 + 理由入力 + 1日1回制限 + 自動バックアップ
- **Level 2 (ステージング)**: 論理削除のみ + 日次バックアップ  
- **Level 3 (本番)**: 削除禁止 + 時間次バックアップ + 即座復旧

## 🔒 セキュリティ

- **JWT**: HS256アルゴリズム + JTI（JWT ID）でセッション管理
- **暗号化**: パスワードはPBKDF2（10,000回）でハッシュ化
- **Redis**: セッション情報暗号化保存（TTL付き）
- **API認証**: Bearer Token + API Key + Tenant ID

## 📊 監視・ログ

- **構造化ログ**: JSON形式でテナント・ユーザー・リクエスト情報付与
- **マルチ出力**: コンソール、ファイル、Redis対応
- **イベントトラッキング**: システム間連携の全イベント記録
- **Redis保存**: 30日間自動保持 + パターン検索対応

## 🛠️ 開発

```bash
# ビルド
npm run build

# 開発モード（ウォッチ）
npm run dev

# クリーンアップ
npm run clean
```

## 📝 型定義

全ての型定義は`src/types/`配下で管理されており、TypeScript環境で完全な型安全性を提供します。

## 🤝 システム間連携

各システムは以下のポートで稼働：
- **hotel-saas**: 3100
- **hotel-member**: 3200  
- **hotel-pms**: 3300
- **hotel-common**: 3400

## 🛡️ データベース安全性ルール

データベース操作を行う際は、以下のルールに従ってください：

- **安全なコマンド**: `npm run db:safe-*` コマンドを使用する
- **定期的なバックアップ**: `npm run db:backup` でバックアップを作成
- **状態確認**: `npm run db:status` で現在の状態を確認
- **詳細ルール**: [データベース安全性ルール](docs/database/DATABASE_SAFETY_RULES.md) を参照

```bash
# 安全なデータベース操作
npm run db:safe-generate  # Prismaクライアント生成
npm run db:safe-push      # スキーマ変更を安全に適用
npm run db:backup         # データベースのバックアップ
npm run db:status         # データベースの状態確認
npm run db:check          # データベース安全性チェック
```

## 📋 TODO

- [ ] 単体テストの実装
- [ ] API仕様書の自動生成
- [ ] Docker化対応
- [ ] 性能監視機能の追加
- [x] データベース安全性ルールの実装

## �� ライセンス

MIT License 