/**
 * Google Playアプリ選択機能のユーティリティ関数
 */
import { Request } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id?: string;
                tenant_id?: string;
                tenantId?: string;
                [key: string]: any;
            };
        }
    }
}
/**
 * リクエストからテナントIDを取得
 */
export declare const getTenantIdFromRequest: (req: Request) => string | null;
/**
 * ページネーションパラメータを解析
 */
export declare const parsePaginationParams: (req: Request) => {
    page: number;
    limit: number;
};
/**
 * ブール値クエリパラメータを解析
 */
export declare const parseBooleanParam: (value: string | undefined) => boolean | undefined;
/**
 * 数値パラメータを解析
 */
export declare const parseNumberParam: (value: string | undefined) => number | undefined;
