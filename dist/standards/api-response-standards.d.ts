/**
 * API標準化ルール
 * ハイブリッド方式における統一レスポンス形式とエラーハンドリング
 */
import type { Response } from 'express';
export interface StandardResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    pagination?: PaginationInfo;
    timestamp: string;
    request_id: string;
}
export interface PaginationInfo {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}
export declare enum StandardErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    INVALID_FORMAT = "INVALID_FORMAT",
    NOT_FOUND = "NOT_FOUND",
    DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
    DATA_CONFLICT = "DATA_CONFLICT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED"
}
/**
 * 標準レスポンスビルダー
 */
export declare class StandardResponseBuilder {
    /**
     * 成功レスポンス
     */
    static success<T>(data: T, pagination?: PaginationInfo): StandardResponse<T>;
    /**
     * エラーレスポンス
     */
    static error(code: StandardErrorCode | string, message: string, details?: any): StandardResponse;
    /**
     * ページネーション情報生成
     */
    static createPagination(page: number, limit: number, totalItems: number): PaginationInfo;
    /**
     * リクエストID生成
     */
    private static generateRequestId;
}
/**
 * Express用レスポンスヘルパー
 */
export declare class ResponseHelper {
    /**
     * 成功レスポンス送信
     */
    static sendSuccess<T>(res: Response, data: T, statusCode?: number, pagination?: PaginationInfo): void;
    /**
     * エラーレスポンス送信
     */
    static sendError(res: Response, code: StandardErrorCode | string, message: string, statusCode?: number, details?: any): void;
    /**
     * バリデーションエラー送信
     */
    static sendValidationError(res: Response, message?: string, details?: any): void;
    /**
     * 認証エラー送信
     */
    static sendUnauthorized(res: Response, message?: string): void;
    /**
     * 権限エラー送信
     */
    static sendForbidden(res: Response, message?: string): void;
    /**
     * 404エラー送信
     */
    static sendNotFound(res: Response, message?: string): void;
    /**
     * 内部エラー送信
     */
    static sendInternalError(res: Response, message?: string, details?: any): void;
}
/**
 * APIエラークラス
 */
export declare class ApiError extends Error {
    statusCode: number;
    code: StandardErrorCode | string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: StandardErrorCode | string, details?: any);
}
/**
 * 共用APIの命名規則
 */
export declare const API_NAMING_CONVENTIONS: {
    readonly COMMON_PREFIX: "/api/v1";
    readonly SAAS_PREFIX: "/api/v1";
    readonly PMS_PREFIX: "/api/v1";
    readonly MEMBER_PREFIX: "/api/v1";
    readonly COMMON_RESOURCES: {
        readonly AUTH: "/auth";
        readonly LOGS: "/logs";
        readonly ACCOUNTING: "/accounting";
        readonly MONITORING: "/monitoring";
    };
    readonly SAAS_RESOURCES: {
        readonly ORDERS: "/orders";
        readonly DEVICES: "/devices";
        readonly CAMPAIGNS: "/campaigns";
    };
    readonly PMS_RESOURCES: {
        readonly ROOMS: "/rooms";
        readonly RESERVATIONS: "/reservations";
    };
    readonly MEMBER_RESOURCES: {
        readonly CUSTOMERS: "/customers";
        readonly RESPONSE_TREE: "/response-tree";
    };
};
/**
 * ログ記録標準
 */
export interface StandardLogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    system: 'hotel-common' | 'hotel-saas' | 'hotel-pms' | 'hotel-member';
    api_path: string;
    method: string;
    user_id?: string;
    tenant_id?: string;
    request_id: string;
    response_time_ms?: number;
    status_code?: number;
    error_code?: string;
    message: string;
    details?: any;
}
