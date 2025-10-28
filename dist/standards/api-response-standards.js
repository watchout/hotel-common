"use strict";
/**
 * API標準化ルール
 * ハイブリッド方式における統一レスポンス形式とエラーハンドリング
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_NAMING_CONVENTIONS = exports.ApiError = exports.ResponseHelper = exports.StandardResponseBuilder = exports.StandardErrorCode = void 0;
// 標準エラーコード
var StandardErrorCode;
(function (StandardErrorCode) {
    // 認証・認可エラー
    StandardErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    StandardErrorCode["FORBIDDEN"] = "FORBIDDEN";
    StandardErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    // バリデーションエラー
    StandardErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    StandardErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    StandardErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    // データエラー
    StandardErrorCode["NOT_FOUND"] = "NOT_FOUND";
    StandardErrorCode["DUPLICATE_ENTRY"] = "DUPLICATE_ENTRY";
    StandardErrorCode["DATA_CONFLICT"] = "DATA_CONFLICT";
    // システムエラー
    StandardErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    StandardErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    StandardErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    // 業務エラー
    StandardErrorCode["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    StandardErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    StandardErrorCode["OPERATION_NOT_ALLOWED"] = "OPERATION_NOT_ALLOWED";
})(StandardErrorCode || (exports.StandardErrorCode = StandardErrorCode = {}));
/**
 * 標準レスポンスビルダー
 */
class StandardResponseBuilder {
    /**
     * 成功レスポンス
     */
    static success(data, pagination) {
        return {
            success: true,
            data,
            pagination,
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId()
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * エラーレスポンス
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static error(code, message, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details) {
        return {
            success: false,
            error: {
                code,
                message,
                details
            },
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId()
        };
    }
    /**
     * ページネーション情報生成
     */
    static createPagination(page, limit, totalItems) {
        const totalPages = Math.ceil(totalItems / limit);
        return {
            page,
            limit,
            total_items: totalItems,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
        };
    }
    /**
     * リクエストID生成
     */
    static generateRequestId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `req-${timestamp}-${random}`;
    }
}
exports.StandardResponseBuilder = StandardResponseBuilder;
/**
 * Express用レスポンスヘルパー
 */
class ResponseHelper {
    /**
     * 成功レスポンス送信
     */
    static sendSuccess(res, data, statusCode = 200, pagination) {
        const response = StandardResponseBuilder.success(data, pagination);
        res.status(statusCode).json(response);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * エラーレスポンス送信
     */
    static sendError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res, code, message, statusCode = 400, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = StandardResponseBuilder.error(code, message, details);
        res.status(statusCode).json(response);
    }
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * バリデーションエラー送信
     */
    static sendValidationError(res, message = '入力データが正しくありません', 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details) {
        this.sendError(res, StandardErrorCode.VALIDATION_ERROR, message, 400, details);
    }
    /**
     * 認証エラー送信
     */
    static sendUnauthorized(res, message = '認証が必要です') {
        this.sendError(res, StandardErrorCode.UNAUTHORIZED, message, 401);
    }
    /**
     * 権限エラー送信
     */
    static sendForbidden(res, message = 'アクセス権限がありません') {
        this.sendError(res, StandardErrorCode.FORBIDDEN, message, 403);
    }
    /**
     * 404エラー送信
     */
    static sendNotFound(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res, message = 'リソースが見つかりません') {
        this.sendError(res, StandardErrorCode.NOT_FOUND, message, 404);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * 内部エラー送信
     */
    static sendInternalError(res, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message = 'システムエラーが発生しました', 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details) {
        this.sendError(res, StandardErrorCode.INTERNAL_ERROR, message, 500, details);
    }
}
exports.ResponseHelper = ResponseHelper;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * APIエラークラス
 */
class ApiError extends Error {
    statusCode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details;
    constructor(message, statusCode = 500, code = StandardErrorCode.INTERNAL_ERROR, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.ApiError = ApiError;
/**
 * 共用APIの命名規則
 */
exports.API_NAMING_CONVENTIONS = {
    // 共用API（全システム共通）
    COMMON_PREFIX: '/api/v1',
    // システム固有API
    SAAS_PREFIX: '/api/v1',
    PMS_PREFIX: '/api/v1',
    MEMBER_PREFIX: '/api/v1',
    // 共用リソース
    COMMON_RESOURCES: {
        AUTH: '/auth',
        LOGS: '/logs',
        ACCOUNTING: '/accounting',
        MONITORING: '/monitoring'
    },
    // 専用リソース
    SAAS_RESOURCES: {
        ORDERS: '/orders',
        DEVICES: '/devices',
        CAMPAIGNS: '/campaigns'
    },
    PMS_RESOURCES: {
        ROOMS: '/rooms',
        RESERVATIONS: '/reservations'
    },
    MEMBER_RESOURCES: {
        CUSTOMERS: '/customers',
        RESPONSE_TREE: '/response-tree'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
};
