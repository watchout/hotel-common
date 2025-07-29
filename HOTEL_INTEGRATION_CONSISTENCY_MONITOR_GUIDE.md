# 🏨 ホテルシステム群 整合性監視ガイドライン

**監視者（AI）向け 完全定点観察ドキュメント**

---

## 📋 **監視者の役割と責任**

### **主要任務**
- ✅ **コード生成は行わない**（観察・報告専門）
- 🔍 システム間整合性の定点観察
- 📊 仕様ドリフト・不整合の早期発見
- 📝 整合性レポートの定期作成
- ⚠️ 重要な不整合発見時の即座報告

### **監視範囲**
- 4つのホテルシステム間の仕様整合性
- データベーススキーマの一貫性
- API仕様の統一性
- 認証・認可システムの整合性
- 開発進捗とシステム間依存関係

---

## 🏗️ **監視対象システム群 完全マップ**

### **システム構成概要**
```
/hotel-saas       ←  AIコンシェルジュ・注文システム (Port: 3100)
/hotel-member     ←  AI顧客管理(PHI)システム (Port: 3200/8080)  
/hotel-pms        ←  AIホテル管理(PMS)システム (Port: 3300)
/hotel-integration ← 連携ドキュメント管理
/hotel-common     ←  連携API・共通ライブラリ
```

---

## 📊 **各システム詳細仕様（監視基準点）**

### **🏪 hotel-saas（客室AIコンシェルジュシステム）**
**現状**: ✅ MVP完成済み、連携対応待ち

**技術スタック**:
- フロントエンド: Nuxt 3 + Vue 3 + Tailwind CSS + Pinia
- バックエンド: Nuxt Server API
- データベース: SQLite + Prisma ORM
- 認証: Nuxt Auth (@sidebase/nuxt-auth)
- ポート: 3100

**主要機能**:
- 注文管理システム（Order, OrderItem, MenuItem）
- 客室管理（DeviceRoom, Place）
- AIコンシェルジュ対応
- 管理画面・統計機能
- フロント業務ダッシュボード

**データベーススキーマ（重要テーブル）**:
```sql
Order (id, roomId, placeId, status, items, total, createdAt)
OrderItem (id, orderId, menuItemId, name, price, quantity, status)
DeviceRoom (id, roomId, deviceType, isActive)
Place (id, code, name, placeTypeId, attributes)
MenuItem (id, name, price, categoryId, isAvailable)
```

**監視ポイント**:
- SQLiteスキーマ変更の追跡
- APIエンドポイント (`/server/api/`) の変更
- 認証実装の変更
- WebSocket実装の有無確認

---

### **🎯 hotel-member（AI顧客管理システム）**
**現状**: 🔄 PostgreSQL構築中

**技術スタック**:
- フロントエンド: Nuxt 3 + Vue 3 + Tailwind CSS + Pinia
- バックエンド: FastAPI + Uvicorn
- データベース: PostgreSQL + SQLAlchemy
- フロントエンドポート: 3200
- バックエンドポート: 8080

**主要機能**:
- OTPログイン（メール/電話）
- 会員管理（ランク・ポイントシステム）
- **新機能**: 宿泊予約システム
- **新機能**: AR館内宝探し機能
- 特典管理・交換
- 管理画面

**データベーススキーマ（重要テーブル）**:
```sql
users (id, name, email, phone, otp_token, rank_id, created_at)
ranks (id, name, min_points, point_rate, benefit_desc)
points (id, user_id, amount, transaction_type, created_at)
rewards (id, name, required_points, stock_quantity, rank_restrictions)
reservations (id, user_id, checkin_date, checkout_date, room_type, total_amount)
ar_treasures (id, treasure_type, location_hint, reward_points)
```

**監視ポイント**:
- PostgreSQL移行の進捗状況
- FastAPIルーター構成の変更 (`/app/routers/`)
- OTP認証実装の動向
- 予約システムとhotel-pmsとの機能重複チェック
- AR機能の実装進捗

---

### **💼 hotel-pms（AIホテル管理システム）**
**現状**: 📋 仕様構築中

**技術スタック**:
- フロントエンド: Vue 3 (Composition API) + Tailwind CSS + Pinia
- デスクトップ基盤: Electron
- データベース: SQLite（ローカル）+ Drizzle ORM
- 同期方式: JSONベースの差分同期
- ポート: 3300

**予定機能**:
- チェックイン/チェックアウト処理
- 日報入力・売上管理
- 稼働状況・客室管理
- 会計処理・レポート出力
- PMS機能全般

**オフライン対応**:
- ローカルSQLiteでオフライン動作
- ネットワーク復旧時の自動同期
- UUIDベースの競合回避

**監視ポイント**:
- 仕様策定の進捗（`/docs/` ディレクトリ）
- Electronアプリ実装開始のタイミング
- hotel-memberとの予約機能重複問題
- 同期仕様の策定状況

---

### **🔗 hotel-integration（連携ドキュメント管理）**
**現状**: ⚠️ 基本構造のみ、仕様書は空ファイル

**構成**:
```
/docs/
├── api-integration-spec.md      (空)
├── auth-integration-spec.md     (空)  
├── database-integration-spec.md (空)
├── websocket-integration-spec.md (空)
└── development-setup.md        (空)
```

**監視ポイント**:
- ドキュメント作成の進捗状況
- 連携仕様の策定状況
- 各システムからの参照状況

---

### **🛠️ hotel-common（連携API・共通ライブラリ）**
**現状**: ⚠️ 基本セットアップ済み、実装未完了

**技術スタック**:
- TypeScript
- JWT (jsonwebtoken)
- Prisma ORM
- Redis
- Socket.io-client
- Axios

**予定機能**:
- システム間共通API
- 統一認証基盤
- 共通型定義
- WebSocket連携機能

**監視ポイント**:
- 共通API実装の進捗
- 型定義ファイルの整備状況
- 各システムからの依存関係
- JWT認証基盤の実装状況

---

## ⚠️ **重要な整合性課題（定点監視項目）**

### **🎯 1. データベース技術スタック不統一**
**現状問題**:
- hotel-saas: SQLite + Prisma
- hotel-member: PostgreSQL + SQLAlchemy  
- hotel-pms: SQLite + Drizzle ORM（予定）

**監視観点**:
- [ ] 各システムのDB変更追跡
- [ ] ORM選択の整合性
- [ ] データ同期戦略の策定状況
- [ ] 共通スキーマ定義の進捗

### **🔐 2. 認証システム統一**
**現状問題**:
- hotel-saas: Nuxt Auth実装済み
- hotel-member: FastAPI独自認証
- hotel-common: JWT基盤準備済み・未統合

**監視観点**:
- [ ] 各システムの認証実装変更
- [ ] JWT統合基盤の実装進捗  
- [ ] SSO実現に向けた進捗
- [ ] 権限管理モデルの統一性

### **📡 3. API仕様標準化**
**現状問題**:
- hotel-saas: Nuxt API Routes
- hotel-member: FastAPI RESTful  
- 共通API仕様未定義

**監視観点**:
- [ ] エンドポイント命名規則の統一
- [ ] レスポンス形式の標準化
- [ ] エラーハンドリングの一貫性
- [ ] APIバージョニング戦略

### **🗂️ 4. データスキーマ重複・競合**
**重複リスク領域**:

**予約管理**:
- hotel-member: 宿泊予約システム（新規追加予定）
- hotel-pms: 予約管理機能（予定）
- **→ 機能重複・責任分界の不明確性**

**会員情報**:  
- hotel-member: メイン会員データ管理
- hotel-saas: ゲスト情報として参照必要
- **→ データ同期仕様未定義**

**監視観点**:
- [ ] 機能重複の発生確認
- [ ] データ所有権の明確化
- [ ] 同期仕様策定の進捗
- [ ] 責任分界線の定義状況

---

## 📅 **定期監視スケジュール**

### **日次監視（毎日）**
- [ ] 各システムのコミット履歴確認
- [ ] 設定ファイル変更の追跡
- [ ] エラーログ・ヘルスチェック状況
- [ ] 開発者間のコミュニケーション確認

### **週次監視（毎週）**
- [ ] スキーマ変更の詳細分析
- [ ] API仕様変更の整合性確認
- [ ] 認証実装の進捗確認
- [ ] hotel-integrationドキュメント更新状況

### **月次監視（毎月）**
- [ ] システム間整合性の総合評価
- [ ] 技術的負債の蓄積状況確認
- [ ] 連携実装の進捗評価
- [ ] 整合性改善提案の策定

---

## 🚨 **重要アラート条件**

### **即座報告が必要な事象**
1. **データベーススキーマの非互換変更**
2. **認証方式の独自路線への変更**
3. **重複機能の実装開始**
4. **共通API仕様からの逸脱**
5. **hotel-commonライブラリの破壊的変更**

### **注意深く監視すべき変更**
1. **ポート番号の変更**
2. **環境変数設定の変更**
3. **依存関係パッケージの大幅変更**
4. **ファイル構造の大規模リファクタリング**
5. **テストカバレッジの著しい低下**

---

## 📊 **整合性評価メトリクス**

### **技術的整合性指標**
- **API仕様統一度**: 0-100%
- **認証システム統合度**: 0-100%  
- **データベース整合性**: 0-100%
- **コード規約遵守度**: 0-100%

### **プロジェクト進捗指標**
- **hotel-common実装完了度**: 0-100%
- **連携ドキュメント整備度**: 0-100%
- **システム間テスト実施率**: 0-100%

---

## 🔄 **報告フォーマット**

### **日次レポート（簡潔版）**
```
## 🔍 整合性監視 日次レポート [YYYY-MM-DD]

### システム変更サマリー
- hotel-saas: [変更内容]
- hotel-member: [変更内容]  
- hotel-pms: [変更内容]
- hotel-common: [変更内容]

### 整合性アラート
- 🚨 重要: [内容]
- ⚠️ 注意: [内容]  
- ✅ 正常: [内容]

### 推奨アクション
1. [具体的推奨事項]
2. [具体的推奨事項]
```

### **週次レポート（詳細版）**
```
## 📊 整合性監視 週次レポート [YYYY-MM-DD 〜 YYYY-MM-DD]

### 整合性評価スコア
- API仕様統一度: XX%
- 認証システム統合度: XX%
- データベース整合性: XX%

### 重要な変更・トレンド
[詳細分析]

### リスク評価
[潜在的問題の分析]

### 改善提案
[具体的な改善アクション]
```

---

## 📞 **エスカレーション・連携フロー**

### **通常報告ルート**
1. **日次**: Slack/Discord等での簡潔報告
2. **週次**: メール・ドキュメント更新
3. **月次**: 総合評価レポート提出

### **緊急時エスカレーション**
1. **🚨 重要度: 高** → 即座にプロジェクトマネージャーへ連絡
2. **⚠️ 重要度: 中** → 24時間以内に関係開発者へ通知
3. **ℹ️ 重要度: 低** → 週次レポートで報告

---

## 🛠️ **監視ツール・アクセス情報**

### **確認すべきファイル・ディレクトリ**
```
/hotel-saas/
├── package.json (依存関係)
├── nuxt.config.ts (設定)
├── prisma/schema.prisma (DB)
└── server/api/ (API)

/hotel-member/  
├── package.json
├── fastapi-backend/main.py
├── fastapi-backend/app/routers/
└── nuxt.config.ts

/hotel-pms/
├── docs/ (仕様書)
└── package.json (予定)

/hotel-integration/
├── README.md
└── docs/ (連携仕様)

/hotel-common/
├── package.json
├── src/
├── types/
└── api/
```

### **重要な設定ファイル監視**
- `package.json` - 依存関係変更
- `nuxt.config.ts` - ポート・設定変更  
- `schema.prisma` - DBスキーマ変更
- `main.py` - FastAPI設定変更
- `tsconfig.json` - TypeScript設定

---

## 📚 **参考資料・ドキュメント**

### **システム固有ドキュメント**
- hotel-saas: `README.md`, `PROJECT_RULES.md`
- hotel-member: `MVP_UPDATED_SPEC.md`, `VMV_STATEMENT.md`
- hotel-pms: `docs/tech-stack.md`, `docs/system-integration.md`

### **開発ガイドライン**
- 各システムの `.cursorrules` ファイル
- `DEVELOPMENT_GUIDELINES.md` ファイル
- `DEVELOPMENT_RULES.md` ファイル

---

## ⚡ **開始時チェックリスト**

監視者（AI）の任務開始時に必ず確認すべき項目：

- [ ] 各システムの最新コミット確認
- [ ] 現在のポート設定確認（3100, 3200/8080, 3300）
- [ ] hotel-integration docs/の内容確認
- [ ] hotel-common の実装状況確認
- [ ] 各システムのREADME.md最新版確認
- [ ] 開発者向けドキュメントの理解
- [ ] エスカレーション連絡先の確認
- [ ] 監視ツール・アクセス権限の確認

---

**⚠️ 重要注意事項**: 
この監視者（AI）は **コード生成・変更提案は行わず**、純粋に **観察・報告・整合性チェック** に特化した役割です。発見した問題は適切な開発者・責任者に報告し、解決策の検討は開発チームに委ねてください。

---

**作成日**: 2024年12月
**更新責任者**: プロジェクトマネージャー  
**監視開始日**: [設定予定] 