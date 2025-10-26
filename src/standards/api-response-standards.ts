/**
 * API標準化ルール
 * ハイブリッド方式における統一レスポンス形式とエラーハンドリング
 */

import { Request } from 'express'

import type { Response } from 'express';

// 統一レスポンス形式
export interface StandardResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: PaginationInfo
  timestamp: string
  request_id: string
}

// ページネーション情報
export interface PaginationInfo {
  page: number
  limit: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// 標準エラーコード
export enum StandardErrorCode {
  // 認証・認可エラー
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // バリデーションエラー
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // データエラー
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  DATA_CONFLICT = 'DATA_CONFLICT',
  
  // システムエラー
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // 業務エラー
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED'
}

/**
 * 標準レスポンスビルダー
 */
export class StandardResponseBuilder {
  /**
   * 成功レスポンス
   */
  static success<T>(data: T, pagination?: PaginationInfo): StandardResponse<T> {
    return {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
      request_id: this.generateRequestId()
    }
  }

  /**
   * エラーレスポンス
   */
  static error(
    code: StandardErrorCode | string,
    message: string,
    details?: any
  ): StandardResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString(),
      request_id: this.generateRequestId()
    }
  }

  /**
   * ページネーション情報生成
   */
  static createPagination(
    page: number,
    limit: number,
    totalItems: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalItems / limit)
    
    return {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  }

  /**
   * リクエストID生成
   */
  private static generateRequestId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `req-${timestamp}-${random}`
  }
}

/**
 * Express用レスポンスヘルパー
 */
export class ResponseHelper {
  /**
   * 成功レスポンス送信
   */
  static sendSuccess<T>(
    res: Response,
    data: T,
    statusCode = 200,
    pagination?: PaginationInfo
  ): void {
    const response = StandardResponseBuilder.success(data, pagination)
    res.status(statusCode).json(response)
  }

  /**
   * エラーレスポンス送信
   */
  static sendError(
    res: Response,
    code: StandardErrorCode | string,
    message: string,
    statusCode = 400,
    details?: any
  ): void {
    const response = StandardResponseBuilder.error(code, message, details)
    res.status(statusCode).json(response)
  }

  /**
   * バリデーションエラー送信
   */
  static sendValidationError(
    res: Response,
    message = '入力データが正しくありません',
    details?: any
  ): void {
    this.sendError(res, StandardErrorCode.VALIDATION_ERROR, message, 400, details)
  }

  /**
   * 認証エラー送信
   */
  static sendUnauthorized(
    res: Response,
    message = '認証が必要です'
  ): void {
    this.sendError(res, StandardErrorCode.UNAUTHORIZED, message, 401)
  }

  /**
   * 権限エラー送信
   */
  static sendForbidden(
    res: Response,
    message = 'アクセス権限がありません'
  ): void {
    this.sendError(res, StandardErrorCode.FORBIDDEN, message, 403)
  }

  /**
   * 404エラー送信
   */
  static sendNotFound(
    res: Response,
    message = 'リソースが見つかりません'
  ): void {
    this.sendError(res, StandardErrorCode.NOT_FOUND, message, 404)
  }

  /**
   * 内部エラー送信
   */
  static sendInternalError(
    res: Response,
    message = 'システムエラーが発生しました',
    details?: any
  ): void {
    this.sendError(res, StandardErrorCode.INTERNAL_ERROR, message, 500, details)
  }
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  public statusCode: number
  public code: StandardErrorCode | string
  public details?: any

  constructor(
    message: string,
    statusCode = 500,
    code: StandardErrorCode | string = StandardErrorCode.INTERNAL_ERROR,
    details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * 共用APIの命名規則
 */
export const API_NAMING_CONVENTIONS = {
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
} as const

/**
 * ログ記録標準
 */
export interface StandardLogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  system: 'hotel-common' | 'hotel-saas' | 'hotel-pms' | 'hotel-member'
  api_path: string
  method: string
  user_id?: string
  tenant_id?: string
  request_id: string
  response_time_ms?: number
  status_code?: number
  error_code?: string
  message: string
  details?: any
}
