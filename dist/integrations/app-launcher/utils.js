"use strict";
/**
 * Google Playアプリ選択機能のユーティリティ関数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNumberParam = exports.parseBooleanParam = exports.parsePaginationParams = exports.getTenantIdFromRequest = void 0;
/**
 * リクエストからテナントIDを取得
 */
const getTenantIdFromRequest = (req) => {
    if (req.user) {
        // tenantIdとtenant_idの両方をチェック（互換性のため）
        if ('tenantId' in req.user) {
            return req.user.tenantId;
        }
        if ('tenant_id' in req.user) {
            return req.user.tenant_id;
        }
    }
    return null;
};
exports.getTenantIdFromRequest = getTenantIdFromRequest;
/**
 * ページネーションパラメータを解析
 */
const parsePaginationParams = (req) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    return {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit))
    };
};
exports.parsePaginationParams = parsePaginationParams;
/**
 * ブール値クエリパラメータを解析
 */
const parseBooleanParam = (value) => {
    if (value === undefined)
        return undefined;
    return value === 'true' || value === '1';
};
exports.parseBooleanParam = parseBooleanParam;
/**
 * 数値パラメータを解析
 */
const parseNumberParam = (value) => {
    if (value === undefined)
        return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
};
exports.parseNumberParam = parseNumberParam;
