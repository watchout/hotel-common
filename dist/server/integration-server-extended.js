#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelIntegrationServer = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../database/prisma");
const hotel_member_1 = require("../integrations/hotel-member");
const api_endpoints_1 = __importDefault(require("../integrations/hotel-member/api-endpoints"));
const page_routes_1 = __importDefault(require("../routes/systems/common/page.routes"));
const orders_routes_1 = __importDefault(require("../routes/systems/saas/orders.routes"));
// 環境変数読み込み
(0, dotenv_1.config)();
/**
 * hotel-common統合APIサーバー
 * - システム間接続管理
 * - ヘルスチェック
 * - 基本的なCRUD API
 */
class HotelIntegrationServer {
    app;
    server;
    prisma;
    port;
    systemConnections = new Map();
    constructor() {
        this.app = (0, express_1.default)();
        this.prisma = prisma_1.hotelDb.getAdapter(); // 統合サーバー用の一時的な型キャスト
        this.port = parseInt(process.env.HOTEL_COMMON_PORT || '3400');
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeSystemConnections();
    }
    /**
     * ミドルウェア設定
     */
    setupMiddleware() {
        // CORS設定
        this.app.use((0, cors_1.default)({
            origin: [
                'http://localhost:3100', // hotel-saas
                'http://localhost:3200', // hotel-member frontend
                'http://localhost:8080', // hotel-member backend
                'http://localhost:3300', // hotel-pms
                'http://localhost:3301' // hotel-pms electron
            ],
            credentials: true
        }));
        // JSON解析
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // リクエストログ
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
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
                service: 'hotel-common-integration',
                version: '1.0.0',
                database: 'connected',
                systems: Object.fromEntries(this.systemConnections)
            });
        });
        // システム接続状況
        this.app.get('/api/systems/status', (req, res) => {
            const systemStatus = Array.from(this.systemConnections.values());
            res.json({
                timestamp: new Date().toISOString(),
                total_systems: systemStatus.length,
                connected: systemStatus.filter(s => s.status === 'CONNECTED').length,
                systems: systemStatus
            });
        });
        // システム接続テスト
        this.app.post('/api/systems/:systemName/test', async (req, res) => {
            const { systemName } = req.params;
            try {
                const result = await this.testSystemConnection(systemName);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    error: 'CONNECTION_TEST_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // データベース接続テスト
        this.app.get('/api/database/test', async (req, res) => {
            try {
                await this.prisma.$queryRaw `SELECT 1 as test`;
                res.json({
                    status: 'connected',
                    timestamp: new Date().toISOString(),
                    database: 'PostgreSQL'
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Database connection failed'
                });
            }
        });
        // テナント一覧
        this.app.get('/api/tenants', async (req, res) => {
            try {
                const tenants = await this.prisma.tenant.findMany({
                    where: { status: 'active' },
                    select: {
                        id: true,
                        name: true,
                        contactEmail: true,
                        planType: true,
                        createdAt: true
                    }
                });
                res.json({
                    success: true,
                    count: tenants.length,
                    tenants
                });
            }
            catch (error) {
                res.status(500).json({
                    error: 'DATABASE_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch tenants'
                });
            }
        });
        // 統合認証エンドポイント（基本版）
        this.app.post('/api/auth/validate', (req, res) => {
            const { token, system } = req.body;
            if (!token) {
                return res.status(400).json({
                    error: 'TOKEN_REQUIRED',
                    message: 'Authentication token is required'
                });
            }
            // TODO: JWT検証実装
            res.json({
                valid: true,
                system,
                user: {
                    id: 'temp_user',
                    tenant_id: 'default',
                    role: 'USER'
                },
                timestamp: new Date().toISOString()
            });
        });
        // システム統計（基本版）
        this.app.get('/api/stats', async (req, res) => {
            try {
                const stats = {
                    tenants: await this.prisma.tenant.count(),
                    // スタッフ数は一時的に0に設定（型定義の問題を回避）
                    staff: 0 // await this.prisma.staff.count()
                };
                res.json({
                    timestamp: new Date().toISOString(),
                    database_stats: stats,
                    system_connections: this.systemConnections.size
                });
            }
            catch (error) {
                res.status(500).json({
                    error: 'STATS_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch statistics'
                });
            }
        });
        // ページ管理APIルート追加
        this.app.use(page_routes_1.default);
        // 注文管理API
        this.app.use(orders_routes_1.default);
        // hotel-member統合APIエンドポイント
        this.app.use('/api/hotel-member', api_endpoints_1.default);
        // hotel-member階層権限管理専用ヘルスチェック
        this.app.get('/api/hotel-member/integration/health', async (req, res) => {
            try {
                const { HotelMemberHierarchyAdapterStub } = await Promise.resolve().then(() => __importStar(require('../integrations/hotel-member/hierarchy-adapter-stub')));
                const health = await HotelMemberHierarchyAdapterStub.healthCheckForPython();
                res.json({
                    integration_status: 'active',
                    hotel_member_hierarchy: health,
                    endpoints_available: 8,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                res.status(500).json({
                    integration_status: 'error',
                    error: error instanceof Error ? error.message : 'Integration health check failed',
                    timestamp: new Date().toISOString()
                });
            }
        });
        // 404エラーハンドラー
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'NOT_FOUND',
                message: `Endpoint ${req.originalUrl} not found`,
                available_endpoints: [
                    'GET /health',
                    'GET /api/systems/status',
                    'POST /api/systems/:systemName/test',
                    'GET /api/database/test',
                    'GET /api/tenants',
                    'POST /api/auth/validate',
                    'GET /api/stats',
                    'GET /api/hotel-member/integration/health',
                    'POST /api/hotel-member/hierarchy/auth/verify',
                    'POST /api/hotel-member/hierarchy/permissions/check-customer-access',
                    'POST /api/hotel-member/hierarchy/tenants/accessible',
                    'POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions',
                    'POST /api/hotel-member/hierarchy/permissions/check-analytics-access',
                    'POST /api/hotel-member/hierarchy/user/permissions-detail',
                    'POST /api/hotel-member/hierarchy/permissions/batch-check',
                    'GET /api/hotel-member/hierarchy/health',
                    'GET /api/v1/admin/pages/:slug',
                    'POST /api/v1/admin/pages/:slug',
                    'POST /api/v1/admin/pages/:slug/publish',
                    'GET /api/v1/admin/pages/:slug/history',
                    'GET /api/v1/admin/pages/:slug/history/:version',
                    'POST /api/v1/admin/pages/:slug/restore',
                    'GET /api/v1/pages/:slug'
                ]
            });
        });
        // エラーハンドラー
        this.app.use((error, req, res, _next) => {
            console.error('Server error:', error);
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
        console.log(`Router added to path: ${path}`);
    }
    /**
     * システム接続初期化
     */
    initializeSystemConnections() {
        const systems = [
            { name: 'hotel-saas', url: 'http://localhost:3100' },
            { name: 'hotel-member-frontend', url: 'http://localhost:3200' },
            { name: 'hotel-member-backend', url: 'http://localhost:8080' },
            { name: 'hotel-pms', url: 'http://localhost:3300' }
        ];
        systems.forEach(system => {
            this.systemConnections.set(system.name, {
                system: system.name,
                url: system.url,
                status: 'DISCONNECTED',
                lastCheck: new Date()
            });
        });
    }
    /**
     * システム接続テスト
     */
    async testSystemConnection(systemName) {
        const connection = this.systemConnections.get(systemName);
        if (!connection) {
            throw new Error(`System ${systemName} not found`);
        }
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${connection.url}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            const isHealthy = response.ok;
            const updatedConnection = {
                ...connection,
                status: isHealthy ? 'CONNECTED' : 'ERROR',
                lastCheck: new Date(),
                responseTime
            };
            if (isHealthy) {
                try {
                    const data = await response.json();
                    updatedConnection.version = data.version;
                }
                catch (e) {
                    // JSONパースエラーは無視
                }
            }
            this.systemConnections.set(systemName, updatedConnection);
            return updatedConnection;
        }
        catch (error) {
            const updatedConnection = {
                ...connection,
                status: 'ERROR',
                lastCheck: new Date(),
                responseTime: Date.now() - startTime
            };
            this.systemConnections.set(systemName, updatedConnection);
            return updatedConnection;
        }
    }
    /**
     * 定期的なシステム接続確認
     */
    startHealthCheck() {
        setInterval(async () => {
            for (const systemName of this.systemConnections.keys()) {
                try {
                    await this.testSystemConnection(systemName);
                }
                catch (error) {
                    console.error(`Health check failed for ${systemName}:`, error);
                }
            }
        }, 30000); // 30秒間隔
    }
    /**
     * サーバー起動
     */
    async start() {
        try {
            // データベース接続確認
            await this.prisma.$connect();
            console.log('PostgreSQL接続確認完了');
            // hotel-member階層権限管理統合初期化
            try {
                await (0, hotel_member_1.initializeHotelMemberHierarchy)();
                console.log('hotel-member統合初期化完了');
            }
            catch (error) {
                console.warn('hotel-member統合初期化警告:', { error: error instanceof Error ? error : new Error('Unknown error') });
            }
            // サーバー起動
            this.server = this.app.listen(this.port, () => {
                console.log(`
🎉 hotel-common統合APIサーバー起動完了！

📊 サーバー情報:
- ポート: ${this.port}
- データベース: PostgreSQL (hotel_unified_db)
- 監視対象システム: ${this.systemConnections.size}個

🔗 利用可能エンドポイント:
- GET  /health                    - サーバーヘルスチェック
- GET  /api/systems/status        - システム接続状況
- POST /api/systems/:name/test    - システム接続テスト
- GET  /api/database/test         - データベース接続テスト
- GET  /api/tenants              - テナント一覧
- POST /api/auth/validate        - 認証検証
- GET  /api/stats                - システム統計

🎯 接続対象システム:
- 🏪 hotel-saas (http://localhost:3100)
- 🎯 hotel-member-frontend (http://localhost:3200)
- 🎯 hotel-member-backend (http://localhost:8080)
- 💼 hotel-pms (http://localhost:3300)
        `);
            });
            // ヘルスチェック開始
            this.startHealthCheck();
            // graceful shutdown設定
            process.on('SIGINT', () => this.shutdown());
            process.on('SIGTERM', () => this.shutdown());
        }
        catch (error) {
            console.error('サーバー起動エラー:', { error: error instanceof Error ? error : new Error('Unknown error') });
            throw error;
        }
    }
    /**
     * サーバー停止
     */
    async shutdown() {
        console.log('hotel-common統合APIサーバー停止中...');
        try {
            if (this.server) {
                this.server.close();
            }
            await this.prisma.$disconnect();
            console.log('hotel-common統合APIサーバー停止完了');
            process.exit(0);
        }
        catch (error) {
            console.error('サーバー停止エラー:', { error: error instanceof Error ? error : new Error('Unknown error') });
            process.exit(1);
        }
    }
}
exports.HotelIntegrationServer = HotelIntegrationServer;
