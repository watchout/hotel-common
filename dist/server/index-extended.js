#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelCommonServer = void 0;
const websocket_server_1 = require("./websocket-server");
const logger_1 = require("../utils/logger");
const dotenv_1 = require("dotenv");
const integration_server_extended_1 = require("./integration-server-extended");
const api_endpoints_1 = require("../integrations/campaigns/api-endpoints");
const ai_concierge_1 = require("../integrations/ai-concierge");
// 環境変数読み込み
(0, dotenv_1.config)();
/**
 * hotel-common統合サーバー（拡張版）
 * - WebSocketサーバー（Event-driven連携）
 * - 統一API Gateway（将来拡張）
 * - 統合監視エンドポイント
 * - 拡張機能
 */
class HotelCommonServer {
    webSocketServer;
    integrationServer;
    logger;
    constructor() {
        this.logger = logger_1.HotelLogger.getInstance();
        // WebSocketサーバー設定
        this.webSocketServer = new websocket_server_1.HotelWebSocketServer({
            port: parseInt(process.env.WEBSOCKET_PORT || '3401'),
            path: '/socket.io',
            serveClient: false,
            cors: {
                origin: [
                    "http://localhost:3100", // hotel-saas
                    "http://localhost:3200", // hotel-member
                    "http://localhost:3300" // hotel-pms
                ],
                credentials: true
            },
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0')
            }
        });
        // 統合APIサーバー設定（拡張版）
        this.integrationServer = new integration_server_extended_1.HotelIntegrationServer();
    }
    /**
     * サーバー起動
     */
    async start() {
        try {
            this.logger.info('🌊 hotel-common統合サーバー（拡張版）起動開始...');
            // WebSocketサーバー起動
            await this.webSocketServer.start();
            // 統合APIサーバー起動
            await this.integrationServer.start();
            // キャンペーン機能統合
            try {
                const campaignRouter = (0, api_endpoints_1.integrateCampaignFeature)();
                this.integrationServer.addRouter('/api/campaigns', campaignRouter);
                this.logger.info('キャンペーン機能を統合しました');
            }
            catch (error) {
                this.logger.warn('キャンペーン機能統合に失敗しました:', { error: error instanceof Error ? error : new Error('Unknown error') });
            }
            // AIコンシェルジュ機能統合
            try {
                (0, ai_concierge_1.integrateAiConciergeFeature)(this.integrationServer);
                this.logger.info('AIコンシェルジュ機能を統合しました');
            }
            catch (error) {
                this.logger.warn('AIコンシェルジュ機能統合に失敗しました:', { error: error instanceof Error ? error : new Error('Unknown error') });
            }
            // 正常起動ログ
            this.logger.info(`
🎉 hotel-common統合基盤（拡張版）稼働開始！

📡 WebSocketサーバー: ポート${process.env.WEBSOCKET_PORT || '3401'}
🌐 統合APIサーバー: ポート${process.env.HOTEL_COMMON_PORT || '3400'}
🗄️  PostgreSQL統一DB: hotel_unified_db
⚡ Event-driven連携: Redis Streams稼働中

接続可能システム:
- 🏪 hotel-saas (port:3100)
- 🎯 hotel-member (port:3200) 
- 💼 hotel-pms (port:3300)

統合機能:
- 🔄 キャンペーン管理API
- 🔐 階層権限管理
- 📊 統合監視
- 🤖 AIコンシェルジュAPI
- 🔌 拡張機能
      `);
            // graceful shutdown設定
            process.on('SIGINT', () => this.shutdown());
            process.on('SIGTERM', () => this.shutdown());
        }
        catch (error) {
            this.logger.error('サーバー起動エラー:', error);
            process.exit(1);
        }
    }
    /**
     * サーバー停止
     */
    async shutdown() {
        this.logger.info('hotel-common統合サーバー停止中...');
        try {
            await this.webSocketServer.stop();
            // 統合APIサーバーの停止
            await this.integrationServer.shutdown();
            this.logger.info('hotel-common統合サーバー停止完了');
            process.exit(0);
        }
        catch (error) {
            this.logger.error('サーバー停止エラー:', error);
            process.exit(1);
        }
    }
}
exports.HotelCommonServer = HotelCommonServer;
// サーバー起動
if (require.main === module) {
    const server = new HotelCommonServer();
    server.start().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
