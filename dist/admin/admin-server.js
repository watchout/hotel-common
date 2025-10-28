"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const admin_api_1 = __importDefault(require("./admin-api"));
// eslint-disable-next-line import/order
// eslint-disable-next-line import/order
const logger_1 = require("../utils/logger");
const app = (0, express_1.default)();
const logger = logger_1.HotelLogger.getInstance();
const PORT = process.env.ADMIN_PORT || 3500;
// ミドルウェア設定
app.use((0, cors_1.default)({
    origin: ['http://localhost:3500', 'http://127.0.0.1:3500'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 静的ファイル配信（管理画面UI）
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ESモジュールの機能を使用
const currentDir = path_1.default.dirname(new URL(import.meta.url).pathname);
app.use('/admin', express_1.default.static(path_1.default.join(currentDir, '.')));
// 管理画面UI（ルート）
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(currentDir, 'admin-dashboard.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path_1.default.join(currentDir, 'admin-dashboard.html'));
});
// テナントサービス管理画面
app.get('/admin/tenant-service-management', (req, res) => {
    res.sendFile(path_1.default.join(currentDir, 'tenant-service-management.html'));
});
// Admin API
app.use('/api/admin', admin_api_1.default);
// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Hotel Admin Management',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// 404ハンドラー
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Endpoint not found',
        path: req.originalUrl
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// エラーハンドラー
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((error, req, res, _next) => {
    logger.error('Admin Server Error:', error);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});
// サーバー起動
app.listen(PORT, () => {
    logger.info(`🏨 Hotel Admin Management Server running on http://localhost:${PORT}`);
    logger.info(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    logger.info(`🔗 API Endpoint: http://localhost:${PORT}/api/admin`);
});
exports.default = app;
