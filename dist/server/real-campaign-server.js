#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealCampaignServer = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const database_1 = require("../database");
const campaigns_1 = require("../integrations/campaigns");
// 環境変数読み込み
(0, dotenv_1.config)();
/**
 * キャンペーンAPI実サーバー
 * - 実際のデータベースに接続
 * - キャンペーン管理API
 * - クライアント向けAPI
 */
class RealCampaignServer {
    app;
    server;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.HOTEL_COMMON_PORT || '3400');
        this.setupMiddleware();
        this.setupRoutes();
    }
    /**
     * ミドルウェア設定
     */
    setupMiddleware() {
        // CORS設定
        this.app.use((0, cors_1.default)({
            origin: '*',
            credentials: true
        }));
        // JSON解析
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // リクエストログ
        this.app.use((req, res, next) => {
            logger_1.logger.api(`${req.method} ${req.path}`, req.method, req.path);
            next();
        });
    }
    /**
     * ルート設定
     */
    setupRoutes() {
        // ヘルスチェック
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'campaign-api-server',
                version: '1.0.0',
                database: 'connected'
            });
        });
        // キャンペーンAPIを統合
        // 統合サーバーとの互換性のためのアダプター
        const integrationServerAdapter = {
            addRouter: (path, router) => {
                this.app.use(path, router);
            }
        };
        // キャンペーン機能を統合
        // @ts-ignore - 引数の型が不一致
        (0, campaigns_1.integrateCampaignFeature)();
        // 404エラーハンドラー
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'NOT_FOUND',
                message: `Endpoint ${req.originalUrl} not found`
            });
        });
        // エラーハンドラー
        this.app.use((error, req, res, _next) => {
            logger_1.logger.error('Server error:', { error: error instanceof Error ? error : new Error(String(error)) });
            res.status(500).json({
                error: 'INTERNAL_ERROR',
                message: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        });
    }
    /**
     * ルーターを追加
     * @param path パス
     * @param router ルーター
     */
    addRouter(path, router) {
        if (!this.app) {
            console.error('Server app is not initialized');
            return;
        }
        this.app.use(path, router);
        logger_1.logger.info(`Router added to path: ${path}`);
    }
    /**
     * サーバー起動
     */
    async start() {
        try {
            // データベース接続確認
            await database_1.prisma.$connect();
            logger_1.logger.info('PostgreSQL接続確認完了');
            // サーバー起動
            this.server = this.app.listen(this.port, () => {
                logger_1.logger.info(`
🎉 キャンペーンAPI実サーバー起動完了！

📊 サーバー情報:
- ポート: ${this.port}
- データベース: PostgreSQL (hotel_unified_db)

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
        }
        catch (error) {
            logger_1.logger.error('サーバー起動エラー:', { error: error instanceof Error ? error : new Error(String(error)) });
            throw error;
        }
    }
    /**
     * サーバー停止
     */
    async shutdown() {
        logger_1.logger.info('キャンペーンAPI実サーバー停止中...');
        try {
            if (this.server) {
                this.server.close();
            }
            await database_1.prisma.$disconnect();
            logger_1.logger.info('キャンペーンAPI実サーバー停止完了');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('サーバー停止エラー:', { error: error instanceof Error ? error : new Error(String(error)) });
            process.exit(1);
        }
    }
}
exports.RealCampaignServer = RealCampaignServer;
// サーバー起動
if (require.main === module) {
    const server = new RealCampaignServer();
    server.start().catch((error) => {
        logger_1.logger.error('Fatal error:', { error });
        process.exit(1);
    });
}
const logger_1 = require("../utils/logger");
// RealCampaignServerクラスのstart()メソッドを修正
// async start(): Promise<void> {
//   try {
//     // データベース接続確認
//     await prisma.$connect();
//     logger.info('PostgreSQL接続確認完了');
//
//     // データベース初期設定
//     try {
//       const dbStatus = await checkCampaignDatabase();
//       if (dbStatus.categories === 0) {
//         await setupCampaignDatabase();
//       }
//       logger.info('データベース状態:', { dbStatus });
//     } catch (setupError) {
//       logger.warn('データベース初期設定中に警告が発生しました', { error: setupError });
//     }
//
//     // サーバー起動
//     ...
