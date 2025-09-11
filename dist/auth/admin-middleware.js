"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = void 0;
const jwt_1 = require("./jwt");
/**
 * 管理者認証ミドルウェア
 */
const adminAuthMiddleware = (req, res, next) => {
    try {
        // 開発環境では認証をスキップ
        if (process.env.NODE_ENV === 'development') {
            // @ts-ignore - 開発環境用のモックデータ
            req.user = {
                user_id: 'dev-admin',
                tenant_id: 'test-tenant-001',
                email: 'admin@example.com',
                role: 'ADMIN',
                permissions: ['read', 'write', 'admin'],
                hierarchy_context: {
                    organization_id: 'org-001',
                    organization_level: 1,
                    organization_type: 'HOTEL',
                    organization_path: 'group_001/brand_001/org-001',
                    access_scope: ['org-001'],
                    data_access_policies: {}
                },
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
                jti: 'mock-jti-' + Math.random().toString(36).substring(2),
                level: 1,
                accessible_tenants: ['test-tenant-001']
            };
            return next();
        }
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: '認証トークンが必要です'
            });
        }
        // @ts-ignore - 型の互換性の問題
        const decoded = (0, jwt_1.verifyToken)(token);
        if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: '管理者権限が必要です'
            });
        }
        // @ts-ignore - 型の互換性の問題
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: '無効なトークンです'
        });
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
