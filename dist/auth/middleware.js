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
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionMiddleware = exports.roleMiddleware = exports.tenantAccessMiddleware = exports.adminMiddleware = exports.authMiddleware = exports.verifyTenantAuth = exports.verifyAdminAuth = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../database/prisma");
// 環境変数読み込み
(0, dotenv_1.config)();
// JWTシークレットキー
const JWT_SECRET = process.env.JWT_SECRET || 'hotel-common-secret-change-in-production';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'hotel-common';
const JWT_STRICT_CLAIMS = (process.env.JWT_STRICT_CLAIMS || 'false').toLowerCase() === 'true';
const ALLOWED_ISSUERS = new Set(['hotel-saas', 'hotel-pms']);
const ALLOWED_SYSTEMS = new Set(['saas', 'pms']);
const ALLOWED_ROLES = new Set(['system', 'admin', 'staff']);
const authLogger = logger_1.HotelLogger.getInstance();
const JWT_REQUIRE_X_TENANT = (process.env.JWT_REQUIRE_X_TENANT || 'false').toLowerCase() === 'true';
// 認証が不要なパブリックパス
const publicPaths = [
    '/health',
    '/api/health',
    '/api/database/test',
    '/api/systems/status'
];
// 管理者認証ミドルウェア
const verifyAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        // @ts-ignore - 型定義が不完全
        const decoded = jwt.verify(token, JWT_SECRET);
        // 管理者権限チェック
        // @ts-ignore - 型定義が不完全
        if (!decoded.role || !['ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        // @ts-ignore - 型定義が不完全
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.verifyAdminAuth = verifyAdminAuth;
// テナント認証ミドルウェア
const verifyTenantAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        // @ts-ignore - 型定義が不完全
        const decoded = jwt.verify(token, JWT_SECRET);
        // @ts-ignore - 型定義が不完全
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.verifyTenantAuth = verifyTenantAuth;
// 認証ミドルウェア
const authMiddleware = (req, res, next) => {
    // パブリックパスの場合はスキップ
    const isPublicPath = publicPaths.some(publicPath => req.path === publicPath || req.path.startsWith(`${publicPath}/`));
    if (isPublicPath) {
        return next();
    }
    // 認証ヘッダーの取得
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Authentication token is required'
        });
    }
    // Bearerトークンの抽出
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            error: 'INVALID_TOKEN_FORMAT',
            message: 'Authorization header must be in format: Bearer [token]'
        });
    }
    const token = parts[1];
    try {
        // JWTトークンの検証（HS256 + exp検証）
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], clockTolerance: 60 });
        req.user = decoded;
        // 必須フィールドの確認（tenant_id, user_id, accessible_tenants）
        if (!req.user.user_id || !req.user.tenant_id) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN_PAYLOAD', message: 'Token payload is missing required fields' },
                timestamp: new Date().toISOString(),
            });
        }
        // X-Tenant-IDヘッダーがあれば一致必須
        const headerTenantId = req.headers['x-tenant-id'];
        if (JWT_REQUIRE_X_TENANT && !headerTenantId) {
            return res.status(403).json({
                success: false,
                error: { code: 'TENANT_HEADER_REQUIRED', message: 'X-Tenant-ID header is required' },
                timestamp: new Date().toISOString(),
            });
        }
        if (headerTenantId && headerTenantId !== req.user.tenant_id) {
            // 403: TENANT_MISMATCH
            // fire-and-forget（認証経路なので非同期に）
            prisma_1.hotelDb.getAdapter().systemEvent.create({
                data: {
                    id: `auth-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    tenant_id: headerTenantId || req.user.tenant_id,
                    user_id: req.user.user_id,
                    event_type: 'AUTH',
                    source_system: 'hotel-common',
                    target_system: 'hotel-common',
                    entity_type: 'auth',
                    entity_id: req.user.user_id || 'unknown',
                    action: 'AUTH_TENANT_MISMATCH',
                    event_data: {
                        path: req.originalUrl,
                        ip: req.ip,
                        user_agent: req.get('User-Agent'),
                    },
                    status: 'FAILED'
                }
            }).catch(() => { });
            return res.status(403).json({
                success: false,
                error: { code: 'TENANT_MISMATCH', message: 'X-Tenant-ID must match JWT tenant_id' },
                timestamp: new Date().toISOString(),
            });
        }
        // accessible_tenants 整合性検証（必ず tenant_id を含む）
        const accessibleTenants = req.user.accessible_tenants || [req.user.tenant_id];
        if (!accessibleTenants.includes(req.user.tenant_id)) {
            return res.status(500).json({
                success: false,
                error: { code: 'INTEGRITY_VIOLATION', message: 'tenant_id must be included in accessible_tenants' },
                timestamp: new Date().toISOString(),
            });
        }
        // === 追加のクレーム検証（v2.0方針） ===
        const issues = [];
        const iss = decoded?.iss;
        const aud = decoded?.aud;
        const system = decoded?.system;
        const roleRaw = decoded?.role;
        const role = roleRaw ? roleRaw.toString().toLowerCase() : undefined;
        const sub = decoded?.sub;
        if (!iss || !ALLOWED_ISSUERS.has(iss)) {
            issues.push({ path: ['iss'], message: `Invalid iss: ${iss || 'missing'}` });
        }
        if (!aud || aud !== JWT_AUDIENCE) {
            issues.push({ path: ['aud'], message: `Invalid aud: ${aud || 'missing'} (expected: ${JWT_AUDIENCE})` });
        }
        if (!system || !ALLOWED_SYSTEMS.has(system)) {
            issues.push({ path: ['system'], message: `Invalid system: ${system || 'missing'}` });
        }
        if (!role || !ALLOWED_ROLES.has(role)) {
            issues.push({ path: ['role'], message: `Invalid role: ${role || 'missing'}` });
        }
        // ユーザー操作時は sub 必須（role !== system の場合）
        if (role !== 'system' && !sub) {
            issues.push({ path: ['sub'], message: 'sub is required for user operations' });
        }
        // 厳格モードなら拒否、そうでなければWARNで通過
        if (issues.length > 0) {
            if (JWT_STRICT_CLAIMS) {
                return res.status(401).json({
                    success: false,
                    error: { code: 'INVALID_CLAIMS', message: 'JWT claims validation failed', details: issues },
                    timestamp: new Date().toISOString()
                });
            }
            else {
                authLogger.warn('JWT claims validation warnings (non-strict mode):', { issues });
            }
        }
        // 正規化（後続で扱いやすいように）
        if (role && req.user) {
            // @ts-ignore
            req.user.role = role;
        }
        if (system && req.user) {
            // @ts-ignore
            req.user.system = system;
        }
        if (sub && req.user && !req.user.sub) {
            // @ts-ignore
            req.user.sub = sub;
        }
        next();
    }
    catch (error) {
        // 419 for expired, 401 otherwise
        const isExpired = error?.name === 'TokenExpiredError';
        const status = isExpired ? 419 : 401;
        const code = isExpired ? 'AUTH_EXPIRED' : 'INVALID_TOKEN';
        try {
            prisma_1.hotelDb.getAdapter().systemEvent.create({
                data: {
                    id: `auth-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    tenant_id: req.headers['x-tenant-id'] || 'unknown',
                    user_id: undefined,
                    event_type: 'AUTH',
                    source_system: 'hotel-common',
                    target_system: 'hotel-common',
                    entity_type: 'auth',
                    entity_id: 'n/a',
                    action: code,
                    event_data: { path: req.originalUrl, ip: req.ip, user_agent: req.get('User-Agent') },
                    status: 'FAILED'
                }
            }).catch(() => { });
        }
        catch { }
        console.error('JWT検証エラー:', error);
        return res.status(status).json({
            success: false,
            error: { code, message: isExpired ? 'Token expired' : 'Invalid token' },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.authMiddleware = authMiddleware;
// 管理者権限チェックミドルウェア
const adminMiddleware = (req, res, next) => {
    // 認証済みであることを確認
    if (!req.user) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Authentication required'
        });
    }
    // 管理者権限の確認
    const role = req.user.role?.toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({
            error: 'FORBIDDEN',
            message: 'Admin privileges required'
        });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
// テナント権限チェックミドルウェア
const tenantAccessMiddleware = (tenantId) => {
    return (req, res, next) => {
        // 認証済みであることを確認
        if (!req.user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required'
            });
        }
        // テナントアクセス権限の確認
        if (req.user.tenant_id !== tenantId) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: 'Access to this tenant is not allowed'
            });
        }
        next();
    };
};
exports.tenantAccessMiddleware = tenantAccessMiddleware;
// ロールベース権限チェックミドルウェア
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // 認証済みであることを確認
        if (!req.user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required'
            });
        }
        // ロール権限の確認
        const role = req.user.role?.toLowerCase();
        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
// パーミッションベース権限チェックミドルウェア
const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        // 認証済みであることを確認
        if (!req.user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required'
            });
        }
        // パーミッション権限の確認
        const permissions = req.user.permissions || [];
        if (!permissions.includes(requiredPermission)) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: `Permission '${requiredPermission}' is required`
            });
        }
        next();
    };
};
exports.permissionMiddleware = permissionMiddleware;
