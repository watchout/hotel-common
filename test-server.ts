#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

// 環境変数読み込み
config();

// 開発環境設定
process.env.NODE_ENV = 'development';

// ルーターのインポート
import checkinSessionRouter from './src/routes/checkin-session.routes';
import sessionBillingRouter from './src/routes/session-billing.routes';
import sessionMigrationRouter from './src/routes/session-migration.routes';
import ordersRouter from './src/routes/systems/saas/orders.routes';
import frontDeskCheckinRouter from './src/routes/systems/common/front-desk-checkin.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 簡易認証ミドルウェア（テスト用）
app.use((req, res, next) => {
  (req as any).user = {
    tenant_id: req.headers['x-tenant-id'] || 'default',
    user_id: 'test-user'
  };
  next();
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルーター設定
app.use('/api/v1/sessions', checkinSessionRouter);
app.use('/api/v1/session-billing', sessionBillingRouter);
app.use('/api/v1/session-migration', sessionMigrationRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/admin/front-desk', frontDeskCheckinRouter);

// エラーハンドリング
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: error.message || 'サーバーエラーが発生しました'
  });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'エンドポイントが見つかりません'
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 テストサーバー起動: http://localhost:${PORT}`);
  console.log(`📊 ヘルスチェック: http://localhost:${PORT}/health`);
  console.log(`🔧 セッション管理API: http://localhost:${PORT}/api/v1/sessions`);
  console.log(`💰 セッション請求API: http://localhost:${PORT}/api/v1/session-billing`);
  console.log(`🔄 セッション移行API: http://localhost:${PORT}/api/v1/session-migration`);
});

export default app;
