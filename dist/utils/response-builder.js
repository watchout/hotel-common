"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardResponseBuilder = void 0;
class StandardResponseBuilder {
    /**
     * 成功レスポンスを作成
     */
    static success(res, data = {}, meta = {}, statusCode = 200) {
        const response = {
            success: true,
            data,
            meta,
            timestamp: new Date().toISOString(),
            request_id: res.locals.requestId || this.generateRequestId()
        };
        return res.status(statusCode).json(response);
    }
    /**
     * エラーレスポンスを作成
     */
    static error(code, message, details) {
        const response = {
            success: false,
            error: {
                code,
                message,
                ...(details && { details })
            },
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId()
        };
        // エラーコードに基づいてHTTPステータスコードを決定
        let status = 500;
        if (code.includes('NOT_FOUND')) {
            status = 404;
        }
        else if (code.includes('VALIDATION_ERROR') || code.includes('MISSING_') || code === 'TENANT_MISMATCH') {
            status = 400;
        }
        else if (code.includes('UNAUTHORIZED') || code.includes('AUTH_') || code.includes('INVALID_TOKEN') || code.includes('TOKEN_EXPIRED') || code.includes('INVALID_REFRESH_TOKEN')) {
            status = 401;
        }
        else if (code.includes('FORBIDDEN') || code.includes('ACCESS_DENIED') || code.includes('TENANT_ACCESS_DENIED') || code.includes('INSUFFICIENT_PERMISSIONS')) {
            status = 403;
        }
        return { response, status };
    }
    /**
     * リクエストIDを生成
     */
    static generateRequestId() {
        return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}
exports.StandardResponseBuilder = StandardResponseBuilder;
