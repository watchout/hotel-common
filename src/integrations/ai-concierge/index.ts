/**
 * AIコンシェルジュ機能統合
 */
import express from 'express';

import responseTreeRoutes from '../../routes/systems/member/response-tree.routes';
import { HotelLogger } from '../../utils/logger';

import type { HotelIntegrationServer } from '../../server/integration-server-extended';

const logger = HotelLogger.getInstance();

/**
 * AIコンシェルジュ機能の統合
 * @param server 統合サーバー
 */
export function integrateAiConciergeFeature(server: HotelIntegrationServer): void {
  try {
    // レスポンスツリーAPIルートを追加
    server.addRouter('/api/v1/ai', responseTreeRoutes);
    
    console.log(`
🤖 AIコンシェルジュ機能統合完了！

🔗 利用可能エンドポイント:
- GET  /api/v1/ai/response-tree                    - レスポンスツリー一覧取得
- GET  /api/v1/ai/response-tree/:treeId            - レスポンスツリー詳細取得
- GET  /api/v1/ai/response-tree/nodes/:nodeId      - ノード詳細取得
- GET  /api/v1/ai/response-tree/nodes/:nodeId/children - 子ノード一覧取得
- GET  /api/v1/ai/response-tree/search             - ノード検索
- POST /api/v1/ai/response-tree/sessions           - セッション開始
- GET  /api/v1/ai/response-tree/sessions/:sessionId - セッション状態取得
- PUT  /api/v1/ai/response-tree/sessions/:sessionId - セッション更新
- DELETE /api/v1/ai/response-tree/sessions/:sessionId - セッション終了
- POST /api/v1/ai/response-tree/mobile-link        - モバイル連携作成
- GET  /api/v1/ai/response-tree/mobile-link/:linkCode - モバイル連携確認
- POST /api/v1/ai/response-tree/mobile-link/:linkCode/connect - モバイル連携実行
- GET  /api/v1/ai/response-tree/qrcode/:linkCode    - QRコード取得
  `);
    
    logger.info('AIコンシェルジュ機能を統合しました');
  } catch (error: Error) {
    logger.error('AIコンシェルジュ機能統合エラー:', { error: error instanceof Error ? error : new Error('Unknown error') });
  }
}