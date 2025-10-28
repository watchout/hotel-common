import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';

// 環境変数読み込み
config();

/**
 * キャンペーンAPI用の簡易サーバー
 * - テスト用の最小限の実装
 */
class SimpleCampaignServer {
  private app: express.Application;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private server: any;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.HOTEL_COMMON_PORT || '3400');

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * ミドルウェア設定
   */
  private setupMiddleware(): void {
    // CORS設定
    this.app.use(cors({
      origin: '*',
      credentials: true
    }));

    // JSON解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // リクエストログ
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * ルート設定
   */
  private setupRoutes(): void {
    // ヘルスチェック
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'campaign-api-test',
        version: '1.0.0'
      });
    });

    // 管理者API - キャンペーン一覧取得
    this.app.get('/api/v1/admin/campaigns', (req, res) => {
      res.json({
        success: true,
        data: [
          {
            id: '1',
            code: 'SUMMER2025',
            name: '夏のキャンペーン',
            description: '夏の特別セール',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-08-31'),
            status: 'ACTIVE',
            displayType: 'BANNER',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
          }
        }
      });
    });

    // 管理者API - キャンペーン作成
    this.app.post('/api/v1/admin/campaigns', (req, res) => {
      const campaignData = req.body;
      res.status(201).json({
        success: true,
        data: {
          id: '2',
          ...campaignData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    });

    // 管理者API - キャンペーン詳細取得
    this.app.get('/api/v1/admin/campaigns/:id', (req, res) => {
      const { id } = req.params;

      if (id === '999') {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'キャンペーンが見つかりません'
        });
      }

      res.json({
        success: true,
        data: {
          id,
          code: 'SUMMER2025',
          name: '夏のキャンペーン',
          description: '夏の特別セール',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-08-31'),
          status: 'ACTIVE',
          displayType: 'BANNER',
          displayPriority: 100,
          ctaType: 'BUTTON',
          ctaText: '詳細を見る',
          ctaUrl: null,
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderAmount: 5000,
          maxUsageCount: 1000,
          perUserLimit: 1,
          timeRestrictions: null,
          dayRestrictions: null,
          welcomeSettings: null,
          translations: [],
          items: [],
          categories: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    });

    // 管理者API - キャンペーン更新
    this.app.put('/api/v1/admin/campaigns/:id', (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      if (id === '999') {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'キャンペーンが見つかりません'
        });
      }

      res.json({
        success: true,
        data: {
          id,
          code: 'SUMMER2025',
          ...updateData,
          updatedAt: new Date()
        }
      });
    });

    // 管理者API - キャンペーン削除
    this.app.delete('/api/v1/admin/campaigns/:id', (req, res) => {
      const { id } = req.params;

      if (id === '999') {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'キャンペーンが見つかりません'
        });
      }

      res.status(204).send();
    });

    // クライアントAPI - アクティブなキャンペーン一覧取得
    this.app.get('/api/v1/campaigns/active', (req, res) => {
      res.json({
        success: true,
        data: [
          {
            id: '1',
            code: 'SUMMER2025',
            name: '夏のキャンペーン',
            description: '夏の特別セール',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-08-31'),
            status: 'ACTIVE',
            displayType: 'BANNER',
            displayPriority: 100,
            ctaType: 'BUTTON',
            ctaText: '詳細を見る',
            discountType: 'PERCENTAGE',
            discountValue: 10
          }
        ]
      });
    });

    // クライアントAPI - カテゴリ別キャンペーン一覧取得
    this.app.get('/api/v1/campaigns/categories/:code', (req, res) => {
      const { code } = req.params;
      res.json({
        success: true,
        data: [
          {
            id: '1',
            code: 'SUMMER2025',
            name: '夏のキャンペーン',
            description: '夏の特別セール',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-08-31'),
            status: 'ACTIVE',
            displayType: 'BANNER',
            displayPriority: 100,
            ctaType: 'BUTTON',
            ctaText: '詳細を見る',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            category: code
          }
        ]
      });
    });

    // 404エラーハンドラー
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: `Endpoint ${req.originalUrl} not found`,
        available_endpoints: [
          'GET /health',
          'GET /api/v1/admin/campaigns',
          'POST /api/v1/admin/campaigns',
          'GET /api/v1/admin/campaigns/:id',
          'PUT /api/v1/admin/campaigns/:id',
          'DELETE /api/v1/admin/campaigns/:id',
          'GET /api/v1/campaigns/active',
          'GET /api/v1/campaigns/categories/:code'
        ]
      });
    });
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    // エラーハンドラー
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * サーバー起動
   */
  async start(): Promise<void> {
    try {
      // サーバー起動
      this.server = this.app.listen(this.port, () => {
        console.log(`
🎉 キャンペーンAPI簡易サーバー起動完了！

📊 サーバー情報:
- ポート: ${this.port}
- モード: テスト用（モックデータ）

🔗 利用可能エンドポイント:
- GET  /health                    - サーバーヘルスチェック
- GET  /api/v1/admin/campaigns    - キャンペーン一覧取得（管理者）
- POST /api/v1/admin/campaigns    - キャンペーン作成（管理者）
- GET  /api/v1/admin/campaigns/:id - キャンペーン詳細取得（管理者）
- PUT  /api/v1/admin/campaigns/:id - キャンペーン更新（管理者）
- DELETE /api/v1/admin/campaigns/:id - キャンペーン削除（管理者）
- GET  /api/v1/campaigns/active   - アクティブなキャンペーン一覧取得（クライアント）
- GET  /api/v1/campaigns/categories/:code - カテゴリ別キャンペーン一覧取得（クライアント）
        `);
      });

      // graceful shutdown設定
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());

    } catch (error: unknown) {
      console.error('サーバー起動エラー:', error);
      throw error;
    }
  }

  /**
   * サーバー停止
   */
  private async shutdown(): Promise<void> {
    console.log('キャンペーンAPI簡易サーバー停止中...');

    try {
      if (this.server) {
        this.server.close();
      }
      console.log('キャンペーンAPI簡易サーバー停止完了');
      process.exit(0);
    } catch (error: unknown) {
      console.error('サーバー停止エラー:', error);
      process.exit(1);
    }
  }
}

// サーバー起動
if (require.main === module) {
  const server = new SimpleCampaignServer();
  server.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SimpleCampaignServer };
