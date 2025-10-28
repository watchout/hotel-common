"use strict";
/**
 * Cookie + Redis セッション認証ミドルウェア
 * SSOT準拠: SSOT_SAAS_ADMIN_AUTHENTICATION.md
 *
 * 目的：
 * - JWT依存からCookie+Redisセッション認証への段階移行
 * - hotel-saas との Cookie 認証統一
 *
 * Cookie互換性：
 * - hotel_session（正式）
 * - hotel-session-id（暫定・互換期間のみ）
 *
 * Redisキー形式：
 * - hotel:session:{sessionId}
 *
 * フロー：
 * 1. Cookie から sessionId 取得（互換対応）
 * 2. Redis から session 取得
 * 3. req.user に tenant_id, user_id 等を設定
 * 4. 下流の権限・tenant分離ミドルウェアで利用
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionAuthMiddleware = void 0;
const logger_1 = require("../utils/logger");
const redis_1 = require("../utils/redis");
const response_builder_1 = require("../utils/response-builder");
const logger = logger_1.HotelLogger.getInstance();
/**
 * Cookie名の互換対応
 * - 正式: hotel_session
 * - 暫定: hotel-session-id（移行期間のみ）
 *
 * 優先順位:
 * 1. cookie-parserによる解析（req.cookies）
 * 2. ヘッダ直読みフォールバック（cookie-parser未適用時の互換）
 */
function extractSessionIdFromCookies(req) {
    console.log('[session-auth] Cookie header:', req.headers.cookie);
    // 1. cookie-parserによる解析結果を優先（推奨）
    if (req.cookies && typeof req.cookies === 'object') {
        console.log('[session-auth] Using cookie-parser result:', Object.keys(req.cookies));
        const sessionId = req.cookies['hotel_session'] || req.cookies['hotel-session-id'] || null;
        if (sessionId) {
            console.log('[session-auth] Extracted sessionId (via cookie-parser):', sessionId.substring(0, 8) + '...');
            return sessionId;
        }
    }
    // 2. フォールバック: ヘッダ直読み（cookie-parser未適用時の互換）
    const cookies = req.headers.cookie;
    if (!cookies) {
        console.log('[session-auth] No cookies found');
        return null;
    }
    const cookieMap = {};
    cookies.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
            cookieMap[key] = value;
        }
    });
    console.log('[session-auth] Parsed cookies (fallback):', Object.keys(cookieMap));
    const sessionId = cookieMap['hotel_session'] || cookieMap['hotel-session-id'] || null;
    if (sessionId) {
        console.log('[session-auth] Extracted sessionId (fallback):', sessionId.substring(0, 8) + '...');
    }
    return sessionId;
}
/**
 * セッション認証ミドルウェア
 *
 * 処理順序：
 * 1. Cookie取得
 * 2. Redis照会
 * 3. req.user設定
 * 4. 下流へ
 */
const sessionAuthMiddleware = async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
req, res, next) => {
    // Phase 0: 入口ログ
    console.log('[session-auth] invoked', {
        path: req.path,
        cookie: (req.headers.cookie || '').slice(0, 80)
    });
    try {
        // 1. Cookie から sessionId 取得
        const sessionId = extractSessionIdFromCookies(req);
        if (!sessionId) {
            logger.warn('セッション認証失敗: Cookieなし', { path: req.path });
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('UNAUTHORIZED', 'Authentication cookie is required').response);
        }
        // 2. Redis から session 取得
        const redis = (0, redis_1.getRedisClient)();
        const sessionInfo = await redis.getSessionById(sessionId);
        if (!sessionInfo) {
            logger.warn('セッション認証失敗: セッション無効または期限切れ', {
                sessionId: sessionId.substring(0, 10) + '...',
                path: req.path
            });
            return res.status(401).json(response_builder_1.StandardResponseBuilder.error('SESSION_EXPIRED', 'Session is invalid or expired').response);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // 3. req.user に設定（下流の権限・tenant分離ミドルウェアで使用）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // SessionInfo型は最小限の情報のみ含むため、追加情報はRedis JSONから取得
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionData = sessionInfo;
        req.user = {
            user_id: sessionInfo.user_id,
            tenant_id: sessionInfo.tenant_id,
            email: sessionData.email || 'unknown',
            role: sessionData.role || 'staff',
            permissions: sessionData.permissions || [],
            sessionId: sessionId,
            // 下流での accessible_tenants 検証用
            accessible_tenants: [sessionInfo.tenant_id]
        };
        logger.info('セッション認証成功', {
            user_id: sessionInfo.user_id,
            tenant_id: sessionInfo.tenant_id,
            path: req.path
        });
        // 4. 下流へ
        next();
    }
    catch (error) {
        logger.error('セッション認証エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('AUTH_ERROR', 'Authentication service error').response);
    }
};
exports.sessionAuthMiddleware = sessionAuthMiddleware;
