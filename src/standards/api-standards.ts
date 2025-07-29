// Hotel Common - API設計標準とガイドライン

import { ApiResponse, ApiError } from '../types/common'
import { ERROR_CODES } from '../types/api'

/**
 * REST API設計標準
 */
export const API_STANDARDS = {
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
} as const

/**
 * エンドポイント命名規則
 */
export const ENDPOINT_NAMING_RULES = {
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
} as const

/**
 * 統一レスポンス形式生成ヘルパー
 */
export class StandardResponseBuilder {
  /**
   * 成功レスポンス生成
   */
  static success<T>(data: T, meta?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      meta,
      timestamp: new Date(),
      request_id: crypto.randomUUID()
    }
  }

  /**
   * ページネーション付き成功レスポンス
   */
  static paginated<T>(
    items: T[], 
    page: number, 
    limit: number, 
    total: number
  ): ApiResponse<{ items: T[], pagination: any }> {
    return {
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
    }
  }

  /**
   * エラーレスポンス生成
   */
  static error(
    code: string, 
    message: string, 
    details?: any,
    statusCode: number = 400
  ): { response: ApiResponse<null>, statusCode: number } {
    const error: ApiError = {
      code,
      message,
      details
    }

    return {
      response: {
        success: false,
        error,
        timestamp: new Date(),
        request_id: crypto.randomUUID()
      },
      statusCode
    }
  }

  /**
   * バリデーションエラーレスポンス
   */
  static validationError(errors: Array<{ field: string; message: string }>): {
    response: ApiResponse<null>, 
    statusCode: number 
  } {
    return this.error(
      ERROR_CODES.B001, // VALIDATION_ERROR
      'Validation failed',
      { errors },
      422
    )
  }

  /**
   * 認証エラーレスポンス
   */
  static authError(message: string = 'Authentication required'): {
    response: ApiResponse<null>, 
    statusCode: number 
  } {
    return this.error(
      ERROR_CODES.E001, // UNAUTHORIZED
      message,
      undefined,
      401
    )
  }

  /**
   * 権限エラーレスポンス
   */
  static forbiddenError(message: string = 'Insufficient permissions'): {
    response: ApiResponse<null>, 
    statusCode: number 
  } {
    return this.error(
      ERROR_CODES.E002, // FORBIDDEN
      message,
      undefined,
      403
    )
  }

  /**
   * リソース未存在エラーレスポンス
   */
  static notFoundError(resource: string): {
    response: ApiResponse<null>, 
    statusCode: number 
  } {
    return this.error(
      ERROR_CODES.E004, // NOT_FOUND
      `${resource} not found`,
      undefined,
      404
    )
  }

  /**
   * データ競合エラーレスポンス
   */
  static conflictError(message: string): {
    response: ApiResponse<null>, 
    statusCode: number 
  } {
    return this.error(
      ERROR_CODES.B003, // RESOURCE_CONFLICT
      message,
      undefined,
      409
    )
  }

  /**
   * サーバーエラーレスポンス
   */
  static serverError(message: string = 'Internal server error'): {
    response: ApiResponse<null>, 
    statusCode: number 
  } {
    return this.error(
      ERROR_CODES.S001, // INTERNAL_SERVER_ERROR
      message,
      undefined,
      500
    )
  }
}

/**
 * 共通リクエストヘッダー定義
 */
export const STANDARD_HEADERS = {
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
} as const

/**
 * ページネーション標準
 */
export const PAGINATION_STANDARDS = {
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
} as const

/**
 * API仕様例（標準テンプレート）
 */
export const API_SPECIFICATION_TEMPLATE = {
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
} as const 