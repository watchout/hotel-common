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
const bcrypt = __importStar(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const jwt_1 = require("../../../auth/jwt");
const database_1 = require("../../../database");
const logger_1 = require("../../../utils/logger");
const redis_1 = require("../../../utils/redis");
const response_builder_1 = require("../../../utils/response-builder");
const router = express_1.default.Router();
const logger = logger_1.HotelLogger.getInstance();
/**
 * ログイン処理
 * POST /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
    console.log('🔐 [AUTH] ログインリクエスト受信 - 修正版コード実行中');
    try {
        const { email, password, tenantId } = req.body;
        // 入力値検証
        if (!email || !password) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', '必須フィールドが不足しています').response);
        }
        // スタッフ認証（メールアドレスで検索）
        const staffMembers = await database_1.hotelDb.getAdapter().staff.findMany({
            where: {
                email,
                is_active: true,
                is_deleted: false
            }
        });
        if (staffMembers.length === 0) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_CREDENTIALS', '認証情報が正しくありません').response);
        }
        // 特定のテナントが指定されている場合は、そのテナントのスタッフに限定
        const candidateStaffList = tenantId
            ? staffMembers.filter(s => s?.tenant_id === tenantId)
            : staffMembers;
        if (tenantId && candidateStaffList.length === 0) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('TENANT_NOT_FOUND', '指定されたテナントにアクセス権がありません').response);
        }
        // パスワードハッシュ照合（bcrypt）
        let selectedStaffMember = null;
        for (const s of candidateStaffList) {
            const hash = s.password_hash;
            if (!hash) {
                logger.info('パスワードハッシュ未設定をスキップ', { email, staffId: s.id });
                continue; // パスワード未設定はスキップ
            }
            logger.info('bcrypt照合開始', { email, hashExists: !!hash });
            const ok = await bcrypt.compare(password, hash);
            logger.info('bcrypt照合結果', { email, result: ok });
            if (ok) {
                selectedStaffMember = s;
                break;
            }
        }
        if (!selectedStaffMember) {
            // 認証情報は伏せて統一エラー
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_CREDENTIALS', '認証情報が正しくありません').response);
        }
        // 複数テナントに所属している場合の処理
        const availableTenants = await Promise.all(staffMembers.map(async (staffMember) => {
            // tenant_idが空または不正な場合はスキップ
            if (!staffMember.tenant_id || staffMember.tenant_id.trim() === '') {
                return {
                    tenantId: staffMember.tenant_id || '',
                    staffId: staffMember.id,
                    staffRole: staffMember.role,
                    tenant: null
                };
            }
            const tenant = await database_1.hotelDb.getAdapter().tenant.findUnique({
                where: { id: staffMember?.tenant_id }
            });
            return {
                tenantId: staffMember?.tenant_id,
                staffId: staffMember.id,
                staffRole: staffMember?.role ?? 'staff',
                tenant: tenant
            };
        }));
        // 選択されたテナントの情報を取得
        const selectedTenantId = selectedStaffMember?.tenant_id ?? '';
        const selectedTenant = availableTenants.find(t => t.tenantId === selectedTenantId)?.tenant;
        // tenant_idが空または不正な場合は、デフォルトテナント情報を使用（PR2: Cookie発行を優先）
        const tenantInfo = selectedTenant || {
            id: selectedTenantId || '',
            name: 'Default Tenant',
            domain: 'default.local'
        };
        // accessible_tenantsを生成（必ずtenant_idを含む）
        const accessibleTenants = availableTenants.map(t => t.tenantId);
        if (!accessibleTenants.includes(selectedTenantId)) {
            accessibleTenants.push(selectedTenantId);
        }
        // JWTトークン生成
        const tokenPayload = {
            user_id: selectedStaffMember.id,
            tenant_id: selectedTenantId,
            email: selectedStaffMember.email,
            role: (selectedStaffMember?.role ?? 'STAFF'),
            level: 3,
            permissions: (selectedStaffMember?.role ?? 'STAFF') === 'SUPER_ADMIN' ? ['*'] : ['tenant:read', 'tenant:write'],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間
            jti: `jwt-${Date.now()}`,
            accessible_tenants: accessibleTenants,
            hierarchy_context: {
                organization_id: selectedTenantId,
                organization_level: 3,
                organization_type: 'HOTEL',
                organization_path: `/${selectedTenantId}`,
                access_scope: ['tenant'],
                data_access_policies: {}
            },
            type: 'access'
        };
        const accessToken = (0, jwt_1.generateToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateToken)({
            ...tokenPayload,
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30日
        });
        // ログイン記録更新
        await database_1.hotelDb.getAdapter().staff.update({
            where: { id: selectedStaffMember.id },
            data: { last_login_at: new Date() }
        });
        logger.info('ログイン成功', { userId: selectedStaffMember.id, tenantId: selectedTenantId, email });
        // === PR2: Cookie+Redisセッション発行 ===
        const sessionId = (0, uuid_1.v4)();
        const redis = (0, redis_1.getRedisClient)();
        const sessionTTL = 3600; // 1時間（暫定）
        // Redisにセッション保存
        await redis.saveSessionById(sessionId, {
            user_id: selectedStaffMember.id,
            tenant_id: selectedTenantId,
            email: selectedStaffMember.email,
            role: selectedStaffMember?.role ?? 'STAFF',
            permissions: selectedStaffMember.role === 'SUPER_ADMIN' ? ['*'] : ['tenant:read', 'tenant:write'],
            accessible_tenants: accessibleTenants,
            created_at: new Date(),
            last_activity: new Date(),
            expires_at: new Date(Date.now() + sessionTTL * 1000)
        }, sessionTTL);
        // Cookie設定
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            path: '/',
            maxAge: sessionTTL
        };
        // 正式Cookie名
        res.cookie('hotel_session', sessionId, cookieOptions);
        // 互換Cookie名（暫定）
        res.cookie('hotel-session-id', sessionId, cookieOptions);
        logger.info('セッションCookie発行', {
            sessionId: sessionId.substring(0, 8) + '...',
            userId: selectedStaffMember.id
        });
        // === END PR2 ===
        // AUTH_LOGIN_MODE による返却内容の切り替え
        const loginMode = (process.env.AUTH_LOGIN_MODE || 'dual').toLowerCase();
        if (loginMode === 'session') {
            // session モード: JWT不要
            return response_builder_1.StandardResponseBuilder.success(res, {
                sessionId, // デバッグ用（本番では削除推奨）
                user: {
                    id: selectedStaffMember.id,
                    email: selectedStaffMember.email,
                    name: selectedStaffMember.name,
                    role: selectedStaffMember.role,
                    tenantId: selectedTenantId
                },
                tenant: selectedTenant,
                availableTenants: availableTenants.map(t => ({
                    id: t.tenantId,
                    name: t.tenant?.name || 'Unknown',
                    domain: t.tenant?.domain || 'unknown.domain',
                    staffRole: t.staffRole
                }))
            });
        }
        else {
            // dual モード（デフォルト）: JWT互換維持
            return response_builder_1.StandardResponseBuilder.success(res, {
                accessToken, // deprecated - 将来削除予定
                refreshToken, // deprecated - 将来削除予定
                sessionId, // デバッグ用（本番では削除推奨）
                user: {
                    id: selectedStaffMember.id,
                    email: selectedStaffMember.email,
                    name: selectedStaffMember.name,
                    role: selectedStaffMember?.role ?? 'STAFF',
                    tenantId: selectedTenantId
                },
                tenant: selectedTenant,
                availableTenants: availableTenants.map(t => ({
                    id: t.tenantId,
                    name: t.tenant?.name || 'Unknown',
                    domain: t.tenant?.domain || 'unknown.domain',
                    staffRole: t.staffRole
                }))
            });
        }
    }
    catch (error) {
        logger.error('ログインエラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('LOGIN_ERROR', error instanceof Error ? error.message : 'ログインに失敗しました').response);
    }
});
/**
 * ログアウト処理
 * POST /api/v1/auth/logout
 */
router.post('/logout', async (req, res) => {
    try {
        // === PR2: Cookie+Redisセッション破棄 ===
        const cookies = req.headers.cookie;
        let sessionId = null;
        if (cookies) {
            const cookieMap = {};
            cookies.split(';').forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                if (key && value) {
                    cookieMap[key] = value;
                }
            });
            // 正式Cookie優先、互換Cookieも確認
            sessionId = cookieMap['hotel_session'] || cookieMap['hotel-session-id'] || null;
        }
        // Redisからセッション削除
        if (sessionId) {
            const redis = (0, redis_1.getRedisClient)();
            try {
                // hotel:session:{sessionId} 形式で削除（SSOTに準拠）
                const deletedCount = await redis.deleteSessionById(sessionId);
                logger.info('セッション削除成功', {
                    sessionId: sessionId.substring(0, 8) + '...',
                    deletedCount
                });
            }
            catch (redisError) {
                logger.warn('Redis削除エラー（継続）', redisError);
            }
        }
        // Cookie破棄
        const isProduction = process.env.NODE_ENV === 'production';
        const clearCookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            path: '/',
            maxAge: 0
        };
        res.cookie('hotel_session', '', clearCookieOptions);
        res.cookie('hotel-session-id', '', clearCookieOptions);
        // === END PR2 ===
        // 旧JWT互換処理（削除予定）
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            try {
                // トークンを検証
                const decoded = (0, jwt_1.verifyToken)(token);
                // ログアウト記録（JWT用）
                logger.info('ログアウト成功（JWT）', {
                    userId: decoded.user_id,
                    tenantId: decoded.tenant_id,
                    email: decoded.email
                });
            }
            catch (verifyError) {
                logger.warn('トークン検証失敗（ログアウト時）', verifyError);
            }
        }
        // 204 No Content（推奨）
        return res.status(204).send();
    }
    catch (error) {
        logger.error('ログアウトエラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('LOGOUT_ERROR', error instanceof Error ? error.message : 'ログアウトに失敗しました').response);
    }
});
/**
 * セッション確認API（PR2追加）
 * GET /api/v1/auth/session
 */
router.get('/session', async (req, res) => {
    try {
        const cookies = req.headers.cookie;
        let sessionId = null;
        if (cookies) {
            const cookieMap = {};
            cookies.split(';').forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                if (key && value) {
                    cookieMap[key] = value;
                }
            });
            sessionId = cookieMap['hotel_session'] || cookieMap['hotel-session-id'] || null;
        }
        if (!sessionId) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('UNAUTHORIZED', 'セッションが見つかりません').response);
        }
        const redis = (0, redis_1.getRedisClient)();
        const sessionInfo = await redis.getSessionById(sessionId);
        if (!sessionInfo) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('SESSION_EXPIRED', 'セッションが無効または期限切れです').response);
        }
        return response_builder_1.StandardResponseBuilder.success(res, {
            user: {
                id: sessionInfo.user_id,
                email: sessionInfo.email,
                role: sessionInfo.role,
                tenantId: sessionInfo.tenant_id
            },
            session: {
                id: sessionId.substring(0, 8) + '...',
                createdAt: sessionInfo.created_at,
                expiresAt: sessionInfo.expires_at
            }
        });
    }
    catch (error) {
        logger.error('セッション確認エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('SESSION_CHECK_ERROR', error instanceof Error ? error.message : 'セッション確認に失敗しました').response);
    }
});
/**
 * テナント切り替え
 * POST /api/v1/auth/switch-tenant
 */
router.post('/switch-tenant', async (req, res) => {
    try {
        const { tenantId } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('MISSING_TOKEN', 'Authorizationヘッダーが必要です').response);
        }
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('MISSING_TENANT_ID', 'テナントIDが必要です').response);
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            // アクセス可能なテナントかチェック（フォールバック対応）
            const accessibleTenants = decoded.accessible_tenants || [decoded.tenant_id];
            if (!accessibleTenants.includes(tenantId)) {
                return res.status(403).json(response_builder_1.StandardResponseBuilder.error('TENANT_ACCESS_DENIED', 'このテナントへのアクセス権がありません').response);
            }
            // テナント情報を取得
            const tenant = await database_1.hotelDb.getAdapter().tenant.findUnique({
                where: { id: tenantId }
            });
            if (!tenant) {
                return res.status(404).json(response_builder_1.StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナントが見つかりません').response);
            }
            // スタッフ情報を取得
            const staff = await database_1.hotelDb.getAdapter().staff.findFirst({
                where: {
                    email: decoded.email,
                    tenant_id: tenantId,
                    is_active: true
                }
            });
            if (!staff) {
                return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフ情報が見つかりません').response);
            }
            // accessible_tenantsを確保（必ずtenant_idを含む）
            const updatedAccessibleTenants = decoded.accessible_tenants || [decoded.tenant_id];
            if (!updatedAccessibleTenants.includes(tenantId)) {
                updatedAccessibleTenants.push(tenantId);
            }
            // 新しいトークンを生成（テナントIDを更新）
            const newTokenPayload = {
                ...decoded,
                tenant_id: tenantId,
                role: staff.role,
                accessible_tenants: updatedAccessibleTenants,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間
                jti: `jwt-${Date.now()}`,
                hierarchy_context: {
                    ...decoded.hierarchy_context,
                    organization_id: tenantId,
                    organization_path: `/${tenantId}`,
                },
                type: decoded.type || 'access'
            };
            const accessToken = (0, jwt_1.generateToken)(newTokenPayload);
            const refreshToken = (0, jwt_1.generateToken)({
                ...newTokenPayload,
                type: 'refresh',
                exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30日
            });
            // ログイン記録更新
            await database_1.hotelDb.getAdapter().staff.update({
                where: { id: staff.id },
                data: { last_login_at: new Date() }
            });
            logger.info('テナント切り替え成功', { userId: staff.id, tenantId, email: staff.email });
            return response_builder_1.StandardResponseBuilder.success(res, {
                accessToken,
                refreshToken,
                expiresIn: 28800, // 8時間（秒）
                tokenType: "Bearer",
                user: {
                    id: staff.id,
                    email: staff.email,
                    name: staff.name,
                    role: staff.role,
                    tenantId
                },
                tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    domain: tenant.domain
                }
            });
        }
        catch (verifyError) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_TOKEN', 'トークンが無効です').response);
        }
    }
    catch (error) {
        logger.error('テナント切り替えエラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('TENANT_SWITCH_ERROR', error instanceof Error ? error.message : 'テナント切り替えに失敗しました').response);
    }
});
/**
 * トークン検証
 * GET /api/v1/auth/validate-token
 */
router.get('/validate-token', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('MISSING_TOKEN', 'Authorizationヘッダーが必要です').response);
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            // トークンの有効性確認
            if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                return res.status(401).json(response_builder_1.StandardResponseBuilder.error('TOKEN_EXPIRED', 'トークンの有効期限が切れています').response);
            }
            return response_builder_1.StandardResponseBuilder.success(res, {
                valid: true,
                user: {
                    user_id: decoded.user_id,
                    tenant_id: decoded.tenant_id,
                    email: decoded.email,
                    role: decoded.role,
                    level: decoded.level,
                    permissions: decoded.permissions
                },
                expires_at: new Date(decoded.exp * 1000)
            });
        }
        catch (verifyError) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_TOKEN', 'トークンが無効です').response);
        }
    }
    catch (error) {
        logger.error('トークン検証エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('TOKEN_VALIDATION_ERROR', error instanceof Error ? error.message : 'トークン検証に失敗しました').response);
    }
});
/**
 * トークンリフレッシュ
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('MISSING_REFRESH_TOKEN', 'リフレッシュトークンが必要です').response);
        }
        try {
            const decoded = (0, jwt_1.verifyToken)(refreshToken);
            // リフレッシュトークンの検証
            if (decoded.type !== 'refresh') {
                return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_REFRESH_TOKEN', '無効なリフレッシュトークンです').response);
            }
            // 新しいアクセストークン生成
            const newTokenPayload = {
                user_id: decoded.user_id,
                tenant_id: decoded.tenant_id,
                email: decoded.email,
                role: decoded.role,
                level: decoded.level,
                permissions: decoded.permissions,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間
                jti: `jwt-${Date.now()}`,
                accessible_tenants: decoded.accessible_tenants || [decoded.tenant_id],
                hierarchy_context: decoded.hierarchy_context
            };
            const newAccessToken = (0, jwt_1.generateToken)(newTokenPayload);
            // 仕様に合わせてレスポンスは accessToken と expires_at のみ返却
            return response_builder_1.StandardResponseBuilder.success(res, {
                accessToken: newAccessToken,
                expires_at: new Date(newTokenPayload.exp * 1000).toISOString()
            });
        }
        catch (verifyError) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_REFRESH_TOKEN', 'リフレッシュトークンが無効です').response);
        }
    }
    catch (error) {
        logger.error('トークンリフレッシュエラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('REFRESH_ERROR', error instanceof Error ? error.message : 'トークンリフレッシュに失敗しました').response);
    }
});
/**
 * 現在のテナント情報取得（管理画面用）
 * GET /api/v1/admin/tenant/current
 */
router.get('/api/v1/admin/tenant/current', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('UNAUTHORIZED', 'Authorization header required').response);
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            // JWT整合性検証
            const accessibleTenants = decoded.accessible_tenants || [decoded.tenant_id];
            if (!accessibleTenants.includes(decoded.tenant_id)) {
                return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'Token integrity violation').response);
            }
            // X-Tenant-ID検証
            const headerTenantId = req.headers['x-tenant-id'];
            if (headerTenantId && headerTenantId !== decoded.tenant_id) {
                return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_MISMATCH', 'X-Tenant-ID must match JWT tenant_id', {
                    jwt_tenant_id: decoded.tenant_id,
                    header_tenant_id: headerTenantId
                }).response);
            }
            // テナント情報取得
            const tenant = await database_1.hotelDb.getAdapter().tenant.findUnique({
                where: { id: decoded.tenant_id },
                select: {
                    id: true,
                    name: true,
                    domain: true,
                    status: true,
                    contactEmail: true,
                    features: true,
                    planType: true,
                    settings: true,
                    createdAt: true
                }
            });
            if (!tenant) {
                return res.status(404).json(response_builder_1.StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナント情報が見つかりません').response);
            }
            return response_builder_1.StandardResponseBuilder.success(res, {
                tenant,
                user: {
                    id: decoded.user_id,
                    email: decoded.email,
                    role: decoded.role,
                    accessible_tenants: accessibleTenants
                }
            });
        }
        catch (verifyError) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('INVALID_TOKEN', 'トークンが無効です').response);
        }
    }
    catch (error) {
        logger.error('現在テナント取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', error instanceof Error ? error.message : '現在テナント情報の取得に失敗しました').response);
    }
});
/**
 * テナント情報取得
 * GET /api/v1/tenants/:id
 */
const middleware_1 = require("../../../auth/middleware");
const tenant_validation_middleware_1 = require("../../../auth/tenant-validation-middleware");
router.get('/api/v1/tenants/:id', middleware_1.authMiddleware, tenant_validation_middleware_1.validateTenantIdHeader, tenant_validation_middleware_1.validateJwtIntegrity, async (req, res) => {
    try {
        const { id } = req.params;
        const requesterTenantId = req.user?.tenant_id;
        if (!requesterTenantId) {
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('UNAUTHORIZED', 'Authentication required').response);
        }
        if (id !== requesterTenantId) {
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('TENANT_ACCESS_DENIED', 'Access to this tenant is not allowed').response);
        }
        const tenant = await database_1.hotelDb.getAdapter().tenant.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                domain: true,
                status: true,
                contactEmail: true,
                features: true,
                planType: true,
                settings: true,
                createdAt: true
            }
        });
        if (!tenant) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナントが見つかりません').response);
        }
        return response_builder_1.StandardResponseBuilder.success(res, tenant);
    }
    catch (error) {
        logger.error('テナント情報取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('TENANT_FETCH_ERROR', error instanceof Error ? error.message : 'テナント情報取得に失敗しました').response);
    }
});
/**
 * スタッフ情報取得
 * GET /api/v1/staff/:id
 */
router.get('/api/v1/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const staff = await database_1.hotelDb.getAdapter().staff.findFirst({
            where: {
                id,
                tenant_id: tenantId
            },
            select: {
                id: true,
                tenant_id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                is_active: true,
                last_login_at: true,
                created_at: true,
                updated_at: true
            }
        });
        if (!staff) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフが見つかりません').response);
        }
        return response_builder_1.StandardResponseBuilder.success(res, staff);
    }
    catch (error) {
        logger.error('スタッフ情報取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_FETCH_ERROR', error instanceof Error ? error.message : 'スタッフ情報取得に失敗しました').response);
    }
});
exports.default = router;
