/**
 * 標準レスポンスビルダー
 * APIレスポンスの統一フォーマットを提供します
 */
import type { Response } from 'express';
interface StandardResponse {
    success: boolean;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        has_next?: boolean;
        [key: string]: any;
    };
    timestamp: string;
    request_id?: string;
}
export declare class StandardResponseBuilder {
    /**
     * 成功レスポンスを作成
     */
    static success(res: Response, data?: any, meta?: any, statusCode?: number): Response;
    /**
     * エラーレスポンスを作成
     */
    static error(code: string, message: string, details?: any): {
        response: StandardResponse;
        status: number;
    };
    /**
     * リクエストIDを生成
     */
    private static generateRequestId;
}
export {};
