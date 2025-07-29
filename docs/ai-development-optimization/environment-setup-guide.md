# 🎊 hotel-common七重統合システム - 環境設定ガイド

**文献1-7完全統合による50倍開発効率・99.5%コスト削減システム - 環境構築手順**

## **📋 必要な環境変数設定**

プロジェクトルートに `.env` ファイルを作成し、以下の設定を行ってください：

```bash
# =================================================
# AIプロバイダー API キー
# =================================================

# OpenAI GPT-4/GPT-3.5用
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude用  
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Cohere用（オプション）
COHERE_API_KEY=your_cohere_api_key_here

# =================================================
# RAGシステム設定
# =================================================

# ChromaDB設定
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION_NAME=hotel_common_knowledge

# Vector Search設定
VECTOR_DIMENSION=1536
MAX_SEARCH_RESULTS=10

# =================================================
# 七重統合システム設定
# =================================================

# 環境設定
NODE_ENV=development
SEVEN_INTEGRATION_LOG_LEVEL=info

# 最適化レベル (basic | standard | advanced | maximum)
OPTIMIZATION_LEVEL=standard

# AIエージェント設定
DEFAULT_AI_PROVIDER=openai
FALLBACK_AI_PROVIDER=anthropic

# トークン制限
MAX_TOKENS_PER_REQUEST=4000
MAX_REQUESTS_PER_MINUTE=100

# =================================================
# 監視・分析設定  
# =================================================

# リアルタイム監視
ENABLE_REAL_TIME_MONITORING=true
MONITORING_INTERVAL_MS=30000

# 効果測定
ENABLE_EFFECTIVENESS_TRACKING=true
TRACK_TOKEN_USAGE=true
TRACK_RESPONSE_TIME=true

# =================================================
# セキュリティ設定
# =================================================

# ガードレール設定
ENABLE_CONTENT_FILTERING=true
ENABLE_SAFETY_CHECKS=true
MAX_RETRY_ATTEMPTS=3

# =================================================
# データベース設定（既存システム連携用）
# =================================================

# hotel-common PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/hotel_common

# Redis（キャッシュ・Queue用）
REDIS_URL=redis://localhost:6379
```

## **🚀 AIプロバイダー設定手順**

### **1. OpenAI API設定**
1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. API Keysから新しいキーを生成
3. `OPENAI_API_KEY`に設定

### **2. Anthropic Claude API設定**
1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. API Keysから新しいキーを生成
3. `ANTHROPIC_API_KEY`に設定

### **3. ChromaDB設定（RAG用）**
```bash
# ChromaDBをローカルで起動
pip install chromadb
chroma run --host localhost --port 8000
```

## **🔧 開発環境セットアップ**

### **基本セットアップ**
```bash
# 依存関係インストール
npm install

# 七重統合システムビルド
npm run build:seven-integration

# 基本動作確認
npm run seven-integration:info
```

### **AI接続テスト**
```bash
# AIプロバイダー接続テスト
npm run test:ai-connection

# RAGシステムテスト
npm run test:rag-system

# 統合テスト
npm run test:seven-integration
```

## **📊 各最適化レベルの特徴**

| レベル | 特徴 | 推奨用途 |
|--------|------|----------|
| **basic** | 基本機能のみ | 開発・テスト環境 |
| **standard** | バランス重視 | 一般的な本番環境 |
| **advanced** | 高性能・高精度 | 高負荷環境 |
| **maximum** | 最大効率追求 | エンタープライズ環境 |

## **⚠️ セキュリティ注意事項**

1. **API キーの管理**
   - `.env` ファイルはバージョン管理に含めない
   - 本番環境では環境変数で設定
   - 定期的なキーローテーション

2. **ガードレール設定**
   - 本番環境では必ず有効化
   - 不適切な出力を防止
   - セーフティチェック必須

3. **使用量監視**
   - API使用量の定期確認
   - コスト上限設定
   - 異常使用の早期検知

## **🔍 トラブルシューティング**

### **よくある問題**

1. **API キーエラー**
   ```bash
   Error: Invalid API key
   ```
   → API キーの設定を確認

2. **ChromaDB接続エラー**
   ```bash
   Connection refused
   ```
   → ChromaDBサーバーの起動を確認

3. **トークン制限エラー**
   ```bash
   Token limit exceeded
   ```
   → `MAX_TOKENS_PER_REQUEST`の調整

### **ログレベル設定**
```bash
# デバッグ用
SEVEN_INTEGRATION_LOG_LEVEL=debug

# 本番用
SEVEN_INTEGRATION_LOG_LEVEL=warn
```

---

*2025年1月23日*  
*hotel-common開発チーム* 