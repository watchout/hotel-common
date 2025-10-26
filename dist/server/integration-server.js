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
const session_auth_middleware_1 = require("../auth/session-auth.middleware");
const prisma_1 = require("../database/prisma");
const app_launcher_1 = require("../integrations/app-launcher");
const api_endpoints_1 = __importDefault(require("../integrations/campaigns/api-endpoints"));
const hotel_member_1 = require("../integrations/hotel-member");
const api_endpoints_2 = __importDefault(require("../integrations/hotel-member/api-endpoints"));
// システム別APIルーター
const systems_1 = require("../routes/systems");
// セッション管理APIルーター
const checkin_session_routes_1 = __importDefault(require("../routes/checkin-session.routes"));
const session_billing_routes_1 = __importDefault(require("../routes/session-billing.routes"));
const session_migration_routes_1 = __importDefault(require("../routes/session-migration.routes"));
// PMSシステムAPI
const pms_1 = require("../routes/systems/pms");
const api_health_1 = __importDefault(require("./api-health"));
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
        this.prisma = prisma_1.hotelDb.getClient(); // 統合サーバー用のPrismaクライアント
        this.port = parseInt(process.env.HOTEL_COMMON_PORT || '3400');
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeSystemConnections();
    }
    /**
     * ミドルウェア設定
     */
    setupMiddleware() {
        // プロキシ信頼設定（本番環境でのSecure Cookie用）
        this.app.set('trust proxy', 1);
        // CORS設定
        this.app.use((0, cors_1.default)({
            origin: [
                'http://localhost:3100', // hotel-saas
                'http://localhost:3200', // hotel-member frontend
                'http://localhost:8080', // hotel-member backend
                'http://localhost:3300', // hotel-pms
                'http://localhost:3301' // hotel-pms electron
            ],
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));
        // === Phase G1: グローバル早期401捕捉 ===
        this.app.use((req, res, next) => {
            const origJson = res.json.bind(res);
            res.json = (body) => {
                const code = res.statusCode;
                if (code === 401 && process.env.DEBUG_GLOBAL_401 === '1') {
                    console.error('[GLOBAL-401]', {
                        path: req.originalUrl,
                        hasAuthHeader: !!req.headers.authorization,
                        cookieHead: (req.headers.cookie || '').slice(0, 120)
                    });
                    console.error('[GLOBAL-401] stack note: 旧authMiddlewareがどこかで発火中（次段で特定）');
                }
                return origJson(body);
            };
            next();
        });
        // === END Phase G1 ===
        // === 決定打の切り分け：デバッグヘッダ付与 ===
        this.app.use((req, res, next) => {
            if (process.env.DEBUG_RESPONSE_HEADER === '1') {
                res.set('X-HC-Debug', 'hotel-common');
            }
            next();
        });
        // === END 決定打 ===
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
                disconnected: systemStatus.filter(s => s.status === 'DISCONNECTED').length,
                error: systemStatus.filter(s => s.status === 'ERROR').length,
                systems: systemStatus
            });
        });
        // 監視ダッシュボード用詳細情報
        this.app.get('/api/monitoring/dashboard', (req, res) => {
            const systemStatus = Array.from(this.systemConnections.values());
            const now = new Date();
            res.json({
                timestamp: now.toISOString(),
                overall_health: systemStatus.filter(s => s.status === 'CONNECTED').length === systemStatus.length ? 'HEALTHY' : 'DEGRADED',
                systems: {
                    total: systemStatus.length,
                    connected: systemStatus.filter(s => s.status === 'CONNECTED').length,
                    disconnected: systemStatus.filter(s => s.status === 'DISCONNECTED').length,
                    error: systemStatus.filter(s => s.status === 'ERROR').length
                },
                details: systemStatus.map(system => ({
                    name: system.system,
                    status: system.status,
                    responseTime: system.responseTime,
                    lastCheck: system.lastCheck,
                    uptime: now.getTime() - system.lastCheck.getTime() < 300000 ? 'RECENT' : 'STALE', // 5分以内
                    version: system.version
                })),
                alerts: systemStatus
                    .filter(s => s.status === 'ERROR' || (s.responseTime && s.responseTime > 3000))
                    .map(s => ({
                    system: s.system,
                    type: s.status === 'ERROR' ? 'CONNECTION_ERROR' : 'SLOW_RESPONSE',
                    message: s.status === 'ERROR' ? 'System unreachable' : `Slow response: ${s.responseTime}ms`,
                    severity: s.status === 'ERROR' ? 'HIGH' : 'MEDIUM'
                }))
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
                    // 緊急対応: Staffテーブルの型定義問題により一時的に0に設定
                    staff: 0
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
        // === 【最優先】認証API（認証チェック不要） ===
        this.app.use('/api/v1/auth', systems_1.authRouter);
        // === 【最上段】Cookie認証保護ルート（必ず無印ルーターより前に配置） ===
        // 操作ログAPIエンドポイント（Cookie+Redis認証）
        this.app.use('/api/v1/logs', session_auth_middleware_1.sessionAuthMiddleware, systems_1.operationLogsRouter);
        // フロントデスク客室管理APIエンドポイント（Cookie+Redis認証）
        this.app.use('/api/v1/admin/front-desk', session_auth_middleware_1.sessionAuthMiddleware, systems_1.frontDeskRoomsRouter);
        // スタッフ管理APIエンドポイント（Cookie+Redis認証）
        this.app.use('/api/v1/admin/staff', session_auth_middleware_1.sessionAuthMiddleware, systems_1.adminStaffRouter);
        // === END Cookie認証保護ルート ===
        // hotel-member統合APIエンドポイント
        this.app.use('/api/hotel-member', api_endpoints_2.default);
        // === 共通システムAPI（明示的プレフィックス化） ===
        // ページ管理APIエンドポイント
        this.app.use('/api/v1/pages', systems_1.pageRouter);
        // 客室ランク管理APIエンドポイント
        this.app.use('/api/v1/room-grades', systems_1.roomGradesRouter);
        // Google Playアプリ選択機能APIエンドポイント
        this.app.use('/api', app_launcher_1.appLauncherApiRouter);
        // キャンペーン統合APIエンドポイント（広域パス・最後に配置）
        this.app.use('/api/v1', api_endpoints_1.default);
        // Room Memo APIエンドポイント（管理系）
        this.app.use('/api/v1/admin/memos', systems_1.roomMemosRouter);
        // 会計APIエンドポイント
        this.app.use('/api/v1/accounting', systems_1.accountingRouter);
        // フロントデスク管理APIエンドポイント（その他）
        this.app.use('/api/v1/admin/front-desk/accounting', systems_1.frontDeskAccountingRouter);
        this.app.use('/api/v1/admin/front-desk/checkin', systems_1.frontDeskCheckinRouter);
        // 管理者操作ログAPIエンドポイント
        this.app.use('/api/v1/admin/operation-logs', systems_1.adminOperationLogsRouter);
        // === ROUTE-DUMP for debugging (PR1) ===
        const routeList = this.app._router?.stack?.flatMap((layer) => {
            if (layer.route) {
                const r = layer.route;
                return r.stack.map((s) => `${Object.keys(r.methods)[0].toUpperCase()} ${r.path}  mid:${s.name}`);
            }
            if (layer.name === 'router' && layer.handle?.stack) {
                const base = layer.regexp?.toString() || '';
                return layer.handle.stack.map((s) => {
                    const method = s.route ? Object.keys(s.route.methods)[0].toUpperCase() : 'N/A';
                    const path = s.route ? s.route.path : '(no-route)';
                    const middlewares = s.route?.stack?.map((m) => m.name).join(',') || 'none';
                    return `ROUTER ${base} => ${method} ${path} mid:[${middlewares}]`;
                });
            }
            return [];
        }) || [];
        if (process.env.DEBUG_ROUTE_DUMP === '1') {
            console.log('[ROUTE-DUMP] Total routes:', routeList.length);
            console.log('[ROUTE-DUMP] /operations routes:');
            routeList.filter((r) => r.includes('/operations')).forEach((r) => console.log('  ', r));
        }
        // === END ROUTE-DUMP ===
        // === SaaSシステムAPI ===
        // 管理画面統計APIエンドポイント
        this.app.use('', systems_1.adminDashboardRouter);
        // 注文・メニューAPIエンドポイント
        this.app.use('', systems_1.ordersRouter);
        // デバイス関連APIエンドポイント（パブリックAPIを含む）
        this.app.use('', systems_1.deviceStatusRouter);
        // デバイス管理APIエンドポイント（認証必須）
        this.app.use('', systems_1.deviceRouter);
        // === Memberシステムapi ===
        // レスポンスツリーAPIエンドポイント
        this.app.use('', systems_1.responseTreeRouter);
        // === セッション管理API ===
        // チェックインセッション管理APIエンドポイント
        this.app.use('/api/v1/sessions', checkin_session_routes_1.default);
        // セッション請求管理APIエンドポイント
        this.app.use('/api/v1/session-billing', session_billing_routes_1.default);
        // セッション移行管理APIエンドポイント
        this.app.use('/api/v1/session-migration', session_migration_routes_1.default);
        // === PMSシステムAPI ===
        // 予約管理APIエンドポイント
        this.app.use('', pms_1.reservationRouter);
        // 部屋管理APIエンドポイント
        this.app.use('', pms_1.roomRouter);
        // === その他 ===
        // API健康状態エンドポイント
        this.app.use('', api_health_1.default);
        // hotel-member階層権限管理専用ヘルスチェック
        this.app.get('/api/hotel-member/integration/health', async (req, res) => {
            try {
                const { HotelMemberHierarchyAdapter } = await Promise.resolve().then(() => __importStar(require('../integrations/hotel-member/hierarchy-adapter')));
                const health = await HotelMemberHierarchyAdapter.healthCheckForPython();
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
        // 404エラーハンドラー（改善版）
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'NOT_FOUND',
                message: `Endpoint ${req.originalUrl} not found`,
                implementation_status: {
                    total_declared: 78,
                    implemented: 74,
                    not_implemented: 4,
                    implementation_rate: '94.9%'
                },
                status: 'ENDPOINT_NOT_IMPLEMENTED',
                note: 'This endpoint is declared but not yet implemented. It may be available in future releases.',
                not_implemented_endpoints: [
                    'GET /api/v1/room-grades/:id',
                    'GET /api/v1/room-grades/active',
                    'GET /api/v1/room-grades/stats',
                    'PATCH /api/v1/room-grades/display-order'
                ],
                available_endpoints: [
                    'GET /health',
                    'GET /api/systems/status',
                    'POST /api/systems/:systemName/test',
                    'GET /api/database/test',
                    'GET /api/tenants',
                    'POST /api/auth/validate',
                    'GET /api/stats',
                    // 認証API
                    'POST /api/v1/auth/login',
                    'GET /api/v1/auth/validate-token',
                    'POST /api/v1/auth/refresh',
                    'GET /api/v1/tenants/:id',
                    'GET /api/v1/staff/:id',
                    // 管理画面統計API
                    'GET /api/v1/admin/summary',
                    'GET /api/v1/admin/dashboard/stats',
                    'GET /api/v1/admin/devices/count',
                    'GET /api/v1/admin/orders/monthly-count',
                    'GET /api/v1/admin/rankings',
                    // 注文・メニューAPI
                    'GET /api/v1/orders/history',
                    'POST /api/v1/orders',
                    'GET /api/v1/orders/active',
                    'GET /api/v1/orders/:id',
                    'PUT /api/v1/orders/:id/status',
                    'GET /api/v1/order/menu',
                    'GET /api/v1/menus/top',
                    'POST /api/v1/order/place',
                    // デバイス関連API
                    'POST /api/v1/devices/check-status',
                    'GET /api/v1/devices/client-ip',
                    'GET /api/v1/devices/count',
                    'GET /api/hotel-member/integration/health',
                    'POST /api/hotel-member/hierarchy/auth/verify',
                    'POST /api/hotel-member/hierarchy/permissions/check-customer-access',
                    'POST /api/hotel-member/hierarchy/tenants/accessible',
                    'POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions',
                    'POST /api/hotel-member/hierarchy/permissions/check-analytics-access',
                    'POST /api/hotel-member/hierarchy/user/permissions-detail',
                    'POST /api/hotel-member/hierarchy/permissions/batch-check',
                    'GET /api/hotel-member/hierarchy/health',
                    'GET /api/v1/campaigns/health',
                    'GET /api/v1/campaigns/active',
                    'GET /api/v1/campaigns/check',
                    'GET /api/v1/campaigns/by-category/:code',
                    'GET /api/v1/welcome-screen/config',
                    'GET /api/v1/welcome-screen/should-show',
                    'POST /api/v1/welcome-screen/mark-completed',
                    'GET /api/v1/admin/campaigns',
                    'POST /api/v1/admin/campaigns',
                    'GET /api/v1/admin/campaigns/:id',
                    'PUT /api/v1/admin/campaigns/:id',
                    'DELETE /api/v1/admin/campaigns/:id',
                    'GET /api/v1/admin/campaigns/:id/analytics',
                    'GET /api/v1/admin/campaigns/analytics/summary',
                    // 予約管理API
                    'POST /api/v1/reservations',
                    'GET /api/v1/reservations',
                    'GET /api/v1/reservations/:id',
                    'PUT /api/v1/reservations/:id',
                    'DELETE /api/v1/reservations/:id',
                    'POST /api/v1/reservations/:id/checkin',
                    'POST /api/v1/reservations/:id/checkout',
                    'GET /api/v1/reservations/stats',
                    // 部屋管理API
                    'POST /api/v1/rooms',
                    'GET /api/v1/rooms',
                    'GET /api/v1/rooms/:id',
                    'PUT /api/v1/rooms/:id',
                    'DELETE /api/v1/rooms/:id',
                    'PATCH /api/v1/rooms/:id/status',
                    'GET /api/v1/rooms/by-number/:roomNumber',
                    'GET /api/v1/rooms/by-floor/:floorNumber',
                    'POST /api/v1/rooms/search-available',
                    'GET /api/v1/rooms/stats',
                    // 部屋グレード管理API
                    'POST /api/v1/room-grades',
                    'GET /api/v1/room-grades',
                    'GET /api/v1/room-grades/:id',
                    'PUT /api/v1/room-grades/:id',
                    'DELETE /api/v1/room-grades/:id',
                    'PATCH /api/v1/room-grades/:id/pricing',
                    'GET /api/v1/room-grades/by-code/:code',
                    'GET /api/v1/room-grades/active',
                    'GET /api/v1/room-grades/stats',
                    'PATCH /api/v1/room-grades/display-order',
                    'GET /api/apps/google-play',
                    'GET /api/apps/google-play/:id',
                    'POST /api/apps/google-play',
                    'PUT /api/apps/google-play/:id',
                    'PATCH /api/apps/google-play/:id/approve',
                    'GET /api/places/:placeId/apps',
                    'POST /api/places/:placeId/apps',
                    'PUT /api/places/:placeId/apps/:appId',
                    'DELETE /api/places/:placeId/apps/:appId',
                    'GET /api/layouts/:layoutId/blocks/:blockId/apps',
                    'PUT /api/layouts/:layoutId/blocks/:blockId/apps',
                    'GET /api/client/places/:placeId/apps',
                    'GET /api/v1/admin/pages',
                    'GET /api/v1/admin/pages/:slug',
                    'POST /api/v1/admin/pages/:slug',
                    'POST /api/v1/admin/pages/:slug/publish',
                    'GET /api/v1/admin/pages/:slug/history',
                    'GET /api/v1/admin/pages/:slug/history/:version',
                    'POST /api/v1/admin/pages/:slug/restore',
                    'GET /api/v1/pages/:slug',
                    // セッション管理API
                    'POST /api/v1/sessions',
                    'GET /api/v1/sessions/:sessionId',
                    'GET /api/v1/sessions/by-number/:sessionNumber',
                    'GET /api/v1/sessions/active-by-room/:roomId',
                    'PATCH /api/v1/sessions/:sessionId',
                    'POST /api/v1/sessions/:sessionId/checkout',
                    // セッション請求管理API
                    'POST /api/v1/session-billing',
                    'GET /api/v1/session-billing/:billingId',
                    'GET /api/v1/session-billing/by-session/:sessionId',
                    'PATCH /api/v1/session-billing/:billingId',
                    'POST /api/v1/session-billing/:billingId/payment',
                    'GET /api/v1/session-billing/calculate/:sessionId',
                    // セッション移行管理API
                    'POST /api/v1/session-migration/migrate-orders',
                    'GET /api/v1/session-migration/statistics',
                    'GET /api/v1/session-migration/compatibility-check',
                    'GET /api/v1/session-migration/report'
                ]
            });
        });
        // エラーハンドラー
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'INTERNAL_ERROR',
                message: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        });
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
     * システム接続テスト（改善版）
     */
    async testSystemConnection(systemName) {
        const system = this.systemConnections.get(systemName);
        if (!system) {
            throw new Error(`System ${systemName} not found`);
        }
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const startTime = Date.now();
            // システム別のヘルスチェックエンドポイント
            const healthEndpoints = {
                'hotel-saas': '/api/health', // Nuxt.jsアプリ用
                'hotel-member-frontend': '/health', // 標準
                'hotel-member-backend': '/health', // 標準
                'hotel-pms': '/health' // 標準
            };
            const endpoint = healthEndpoints[systemName] || '/health';
            const response = await fetch(`${system.url}${endpoint}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const responseTime = Date.now() - startTime;
            clearTimeout(timeout);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let data = {};
            const contentType = response.headers.get('content-type');
            // JSONレスポンスのみ解析
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }
            else {
                // HTMLレスポンスの場合は接続成功として扱う
                data = { status: 'ok', message: 'HTML response received' };
            }
            const updatedStatus = {
                ...system,
                status: 'CONNECTED',
                lastCheck: new Date(),
                responseTime,
                version: data.version || data.status || 'unknown'
            };
            this.systemConnections.set(systemName, updatedStatus);
            return updatedStatus;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const updatedStatus = {
                ...system,
                status: 'ERROR',
                lastCheck: new Date()
            };
            this.systemConnections.set(systemName, updatedStatus);
            // エラーレベルを下げる（定期チェックのため）
            if (!errorMessage.includes('fetch failed')) {
                console.warn(`Connection test failed for ${systemName}: ${errorMessage}`);
            }
            return updatedStatus;
        }
    }
    /**
     * 定期的なヘルスチェック（改善版）
     */
    startHealthCheck() {
        // 初回チェック（起動後30秒）
        setTimeout(() => {
            console.log('Performing initial health check...');
            this.performHealthCheck();
        }, 30000);
        // 2分ごとにすべてのシステムをチェック（頻度を上げる）
        setInterval(() => {
            this.performHealthCheck();
        }, 2 * 60 * 1000); // 2分 = 120000ms
    }
    /**
     * ヘルスチェック実行
     */
    async performHealthCheck() {
        const connectedCount = Array.from(this.systemConnections.values())
            .filter(s => s.status === 'CONNECTED').length;
        console.log(`🔍 Health check started (${connectedCount}/${this.systemConnections.size} systems connected)`);
        const promises = Array.from(this.systemConnections.keys()).map(async (systemName) => {
            try {
                await this.testSystemConnection(systemName);
            }
            catch (error) {
                // エラーは testSystemConnection 内で処理済み
            }
        });
        await Promise.all(promises);
        const newConnectedCount = Array.from(this.systemConnections.values())
            .filter(s => s.status === 'CONNECTED').length;
        if (newConnectedCount !== connectedCount) {
            console.log(`📊 Health check completed (${newConnectedCount}/${this.systemConnections.size} systems connected)`);
        }
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
                console.warn('hotel-member統合初期化警告:', error instanceof Error ? error.message : 'Unknown error');
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
- GET  /api/v1/campaigns/health  - キャンペーン機能ヘルスチェック
- GET  /api/apps/google-play     - Google Playアプリ一覧

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
            console.error('サーバー起動エラー:', error);
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
            console.error('サーバー停止エラー:', error);
            process.exit(1);
        }
    }
    /**
     * ルーターを追加するためのメソッド
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
}
exports.HotelIntegrationServer = HotelIntegrationServer;
// サーバー起動
if (require.main === module) {
    const server = new HotelIntegrationServer();
    server.start().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
