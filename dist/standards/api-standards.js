"use strict";
// Hotel Common - API設計標準とガイドライン
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_SPECIFICATION_TEMPLATE = exports.PAGINATION_STANDARDS = exports.STANDARD_HEADERS = exports.StandardResponseBuilder = exports.ENDPOINT_NAMING_RULES = exports.API_STANDARDS = void 0;
const api_1 = require("../types/api");
/**
 * REST API設計標準
 */
exports.API_STANDARDS = {
    // バージョニング
    VERSION_PREFIX: '/api/v1',
    // HTTP メソッド使用規則
    METHODS: {
        GET: '一覧取得・詳細取得',
        POST: '新規作成',
        PUT: '全体更新（全フィールド必須）',
        PATCH: '部分更新（一部フィールドのみ）',
        DELETE: '削除'
    },
    // ステータスコード標準
    STATUS_CODES: {
        // 成功
        200: 'OK - 取得・更新成功',
        201: 'Created - 作成成功',
        204: 'No Content - 削除成功',
        // クライアントエラー
        400: 'Bad Request - リクエスト形式エラー',
        401: 'Unauthorized - 認証必須',
        403: 'Forbidden - 権限不足',
        404: 'Not Found - リソース存在しない',
        409: 'Conflict - データ競合',
        422: 'Unprocessable Entity - バリデーションエラー',
        // サーバーエラー
        500: 'Internal Server Error - サーバー内部エラー',
        502: 'Bad Gateway - 外部サービスエラー',
        503: 'Service Unavailable - サービス利用不可'
    }
};
/**
 * エンドポイント命名規則
 */
exports.ENDPOINT_NAMING_RULES = {
    // リソース名は複数形
    RESOURCES: {
        PLURAL: true,
        EXAMPLES: [
            '/api/v1/reservations',
            '/api/v1/customers',
            '/api/v1/orders',
            '/api/v1/rooms'
        ]
    },
    // 階層構造
    NESTED: {
        EXAMPLES: [
            '/api/v1/customers/{customer_id}/reservations',
            '/api/v1/reservations/{reservation_id}/orders',
            '/api/v1/hotels/{hotel_id}/rooms'
        ]
    },
    // アクション（動詞）は避ける
    AVOID_VERBS: {
        BAD: [
            '/api/v1/get-customers',
            '/api/v1/create-reservation',
            '/api/v1/cancel-order'
        ],
        GOOD: [
            'GET /api/v1/customers',
            'POST /api/v1/reservations',
            'PATCH /api/v1/orders/{id} {"status": "cancelled"}'
        ]
    }
};
/**
 * 統一レスポンス形式生成ヘルパー
 */
class StandardResponseBuilder {
    /**
     * 成功レスポンス生成
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static success(res, data, meta, statusCode = 200) {
        const response = {
            success: true,
            data,
            meta,
            timestamp: new Date(),
            request_id: crypto.randomUUID()
        };
        return res.status(statusCode).json(response);
    }
    /**
     * ページネーション付き成功レスポンス
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static paginated(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res, items, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    limit, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    total, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statusCode = 200
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = {
            success: true,
            data: {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    total_pages: Math.ceil(total / limit),
                    has_next: page * limit < total,
                    has_previous: page > 1
                }
            },
            timestamp: new Date(),
            request_id: crypto.randomUUID()
        };
        return res.status(statusCode).json(response);
    }
    /**
     * エラーレスポンス生成
     * @param code エラーコード
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * @param message エラーメッセージ
     * @param details 詳細情報（オプション）
     * @param statusCode HTTPステータスコード（デフォルト400）
     * @returns レスポンスオブジェクトとステータスコード
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    static error(code, message, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details, statusCode = 400) {
        const error = {
            code,
            message,
            details
        };
        return {
            response: {
                success: false,
                error,
                timestamp: new Date(),
                request_id: crypto.randomUUID()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            },
            statusCode
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * レガシーエラーレスポンス生成（互換性のため維持）
     * @deprecated 新しいコードでは使用しないでください。代わりに標準のerror()メソッドを使用してください。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static legacyError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res, code, message, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        const { response, statusCode } = this.error(code, message, details);
        return res.status(statusCode).json(response);
    }
    /**
     * バリデーションエラーレスポンス
     */
    static validationError(errors) {
        return this.error(api_1.ERROR_CODES.B001, // VALIDATION_ERROR
        'Validation failed', { errors }, 422);
    }
    /**
     * 認証エラーレスポンス
     */
    static authError(message = 'Authentication required') {
        return this.error(api_1.ERROR_CODES.E001, // UNAUTHORIZED
        message, undefined, 401);
    }
    /**
     * 権限エラーレスポンス
     */
    static forbiddenError(message = 'Insufficient permissions') {
        return this.error(api_1.ERROR_CODES.E002, // FORBIDDEN
        message, undefined, 403);
    }
    /**
     * リソース未存在エラーレスポンス
     */
    static notFoundError(resource) {
        return this.error(api_1.ERROR_CODES.E004, // NOT_FOUND
        `${resource} not found`, undefined, 404);
    }
    /**
     * データ競合エラーレスポンス
     */
    static conflictError(message) {
        return this.error(api_1.ERROR_CODES.B003, // RESOURCE_CONFLICT
        message, undefined, 409);
    }
    /**
     * サーバーエラーレスポンス
     */
    static serverError(message = 'Internal server error') {
        return this.error(api_1.ERROR_CODES.S001, // INTERNAL_SERVER_ERROR
        message, undefined, 500);
    }
}
exports.StandardResponseBuilder = StandardResponseBuilder;
/**
 * 共通リクエストヘッダー定義
 */
exports.STANDARD_HEADERS = {
    REQUIRED: [
        'Content-Type: application/json',
        'Authorization: Bearer {token}',
        'X-Tenant-ID: {tenant_id}'
    ],
    OPTIONAL: [
        'X-Request-ID: {uuid}',
        'X-API-Key: {api_key}',
        'Accept-Language: ja-JP,en-US'
    ]
};
/**
 * ページネーション標準
 */
exports.PAGINATION_STANDARDS = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
    // クエリパラメータ
    QUERY_PARAMS: {
        page: 'page',
        limit: 'limit',
        sort: 'sort',
        order: 'order',
        filter: 'filter',
        search: 'search'
    },
    // ソート例
    SORT_EXAMPLES: [
        'created_at:desc',
        'name:asc',
        'total_amount:desc'
    ],
    // フィルター例  
    FILTER_EXAMPLES: [
        'status:confirmed',
        'room_type:deluxe',
        'check_in_date:gte:2024-01-01'
    ]
};
/**
 * API仕様例（標準テンプレート）
 */
exports.API_SPECIFICATION_TEMPLATE = {
    // 予約管理API例
    RESERVATIONS: {
        LIST: {
            method: 'GET',
            path: '/api/v1/reservations',
            query: '?page=1&limit=20&sort=created_at:desc&filter=status:confirmed',
            response: {
                success: true,
                data: {
                    items: [
                        {
                            id: 'uuid',
                            guest_name: 'string',
                            check_in: 'date',
                            check_out: 'date',
                            status: 'enum',
                            total_amount: 'number'
                        }
                    ],
                    pagination: {
                        page: 1,
                        limit: 20,
                        total: 100,
                        total_pages: 5
                    }
                }
            }
        },
        GET: {
            method: 'GET',
            path: '/api/v1/reservations/{id}',
            response: {
                success: true,
                data: {
                    id: 'uuid',
                    guest_name: 'string',
                    // ... 詳細フィールド
                }
            }
        },
        CREATE: {
            method: 'POST',
            path: '/api/v1/reservations',
            body: {
                guest_name: 'string',
                guest_email: 'email',
                check_in: 'date',
                check_out: 'date',
                // ... 必要フィールド
            },
            response: {
                success: true,
                data: {
                    id: 'uuid',
                    // ... 作成されたデータ
                }
            }
        }
    }
};
