import type { ApiResponse } from '../types/common';
/**
 * REST API設計標準
 */
export declare const API_STANDARDS: {
    readonly VERSION_PREFIX: "/api/v1";
    readonly METHODS: {
        readonly GET: "一覧取得・詳細取得";
        readonly POST: "新規作成";
        readonly PUT: "全体更新（全フィールド必須）";
        readonly PATCH: "部分更新（一部フィールドのみ）";
        readonly DELETE: "削除";
    };
    readonly STATUS_CODES: {
        readonly 200: "OK - 取得・更新成功";
        readonly 201: "Created - 作成成功";
        readonly 204: "No Content - 削除成功";
        readonly 400: "Bad Request - リクエスト形式エラー";
        readonly 401: "Unauthorized - 認証必須";
        readonly 403: "Forbidden - 権限不足";
        readonly 404: "Not Found - リソース存在しない";
        readonly 409: "Conflict - データ競合";
        readonly 422: "Unprocessable Entity - バリデーションエラー";
        readonly 500: "Internal Server Error - サーバー内部エラー";
        readonly 502: "Bad Gateway - 外部サービスエラー";
        readonly 503: "Service Unavailable - サービス利用不可";
    };
};
/**
 * エンドポイント命名規則
 */
export declare const ENDPOINT_NAMING_RULES: {
    readonly RESOURCES: {
        readonly PLURAL: true;
        readonly EXAMPLES: readonly ["/api/v1/reservations", "/api/v1/customers", "/api/v1/orders", "/api/v1/rooms"];
    };
    readonly NESTED: {
        readonly EXAMPLES: readonly ["/api/v1/customers/{customer_id}/reservations", "/api/v1/reservations/{reservation_id}/orders", "/api/v1/hotels/{hotel_id}/rooms"];
    };
    readonly AVOID_VERBS: {
        readonly BAD: readonly ["/api/v1/get-customers", "/api/v1/create-reservation", "/api/v1/cancel-order"];
        readonly GOOD: readonly ["GET /api/v1/customers", "POST /api/v1/reservations", "PATCH /api/v1/orders/{id} {\"status\": \"cancelled\"}"];
    };
};
/**
 * 統一レスポンス形式生成ヘルパー
 */
export declare class StandardResponseBuilder {
    /**
     * 成功レスポンス生成
     */
    static success<T>(res: any, data: T, meta?: any, statusCode?: number): any;
    /**
     * ページネーション付き成功レスポンス
     */
    static paginated<T>(res: any, items: T[], page: number, limit: number, total: number, statusCode?: number): any;
    /**
     * エラーレスポンス生成
     * @param code エラーコード
     * @param message エラーメッセージ
     * @param details 詳細情報（オプション）
     * @param statusCode HTTPステータスコード（デフォルト400）
     * @returns レスポンスオブジェクトとステータスコード
     */
    static error(code: string, message: string, details?: any, statusCode?: number): {
        response: ApiResponse<null>;
        statusCode: number;
    };
    /**
     * レガシーエラーレスポンス生成（互換性のため維持）
     * @deprecated 新しいコードでは使用しないでください。代わりに標準のerror()メソッドを使用してください。
     */
    static legacyError(res: any, code: string, message: string, details?: any): any;
    /**
     * バリデーションエラーレスポンス
     */
    static validationError(errors: Array<{
        field: string;
        message: string;
    }>): {
        response: ApiResponse<null>;
        statusCode: number;
    };
    /**
     * 認証エラーレスポンス
     */
    static authError(message?: string): {
        response: ApiResponse<null>;
        statusCode: number;
    };
    /**
     * 権限エラーレスポンス
     */
    static forbiddenError(message?: string): {
        response: ApiResponse<null>;
        statusCode: number;
    };
    /**
     * リソース未存在エラーレスポンス
     */
    static notFoundError(resource: string): {
        response: ApiResponse<null>;
        statusCode: number;
    };
    /**
     * データ競合エラーレスポンス
     */
    static conflictError(message: string): {
        response: ApiResponse<null>;
        statusCode: number;
    };
    /**
     * サーバーエラーレスポンス
     */
    static serverError(message?: string): {
        response: ApiResponse<null>;
        statusCode: number;
    };
}
/**
 * 共通リクエストヘッダー定義
 */
export declare const STANDARD_HEADERS: {
    readonly REQUIRED: readonly ["Content-Type: application/json", "Authorization: Bearer {token}", "X-Tenant-ID: {tenant_id}"];
    readonly OPTIONAL: readonly ["X-Request-ID: {uuid}", "X-API-Key: {api_key}", "Accept-Language: ja-JP,en-US"];
};
/**
 * ページネーション標準
 */
export declare const PAGINATION_STANDARDS: {
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
    readonly DEFAULT_PAGE: 1;
    readonly QUERY_PARAMS: {
        readonly page: "page";
        readonly limit: "limit";
        readonly sort: "sort";
        readonly order: "order";
        readonly filter: "filter";
        readonly search: "search";
    };
    readonly SORT_EXAMPLES: readonly ["created_at:desc", "name:asc", "total_amount:desc"];
    readonly FILTER_EXAMPLES: readonly ["status:confirmed", "room_type:deluxe", "check_in_date:gte:2024-01-01"];
};
/**
 * API仕様例（標準テンプレート）
 */
export declare const API_SPECIFICATION_TEMPLATE: {
    readonly RESERVATIONS: {
        readonly LIST: {
            readonly method: "GET";
            readonly path: "/api/v1/reservations";
            readonly query: "?page=1&limit=20&sort=created_at:desc&filter=status:confirmed";
            readonly response: {
                readonly success: true;
                readonly data: {
                    readonly items: readonly [{
                        readonly id: "uuid";
                        readonly guest_name: "string";
                        readonly check_in: "date";
                        readonly check_out: "date";
                        readonly status: "enum";
                        readonly total_amount: "number";
                    }];
                    readonly pagination: {
                        readonly page: 1;
                        readonly limit: 20;
                        readonly total: 100;
                        readonly total_pages: 5;
                    };
                };
            };
        };
        readonly GET: {
            readonly method: "GET";
            readonly path: "/api/v1/reservations/{id}";
            readonly response: {
                readonly success: true;
                readonly data: {
                    readonly id: "uuid";
                    readonly guest_name: "string";
                };
            };
        };
        readonly CREATE: {
            readonly method: "POST";
            readonly path: "/api/v1/reservations";
            readonly body: {
                readonly guest_name: "string";
                readonly guest_email: "email";
                readonly check_in: "date";
                readonly check_out: "date";
            };
            readonly response: {
                readonly success: true;
                readonly data: {
                    readonly id: "uuid";
                };
            };
        };
    };
};
