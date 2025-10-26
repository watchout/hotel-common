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

export class StandardResponseBuilder {
  /**
   * 成功レスポンスを作成
   */
  static success(res: Response, data: any = {}, meta: any = {}, statusCode = 200): Response {
    const response: StandardResponse = {
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
  static error(code: string, message: string, details?: any): { response: StandardResponse, status: number } {
    const response: StandardResponse = {
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
    } else if (code.includes('VALIDATION_ERROR') || code.includes('MISSING_') || code === 'TENANT_MISMATCH') {
      status = 400;
    } else if (code.includes('UNAUTHORIZED') || code.includes('AUTH_') || code.includes('INVALID_TOKEN') || code.includes('TOKEN_EXPIRED') || code.includes('INVALID_REFRESH_TOKEN')) {
      status = 401;
    } else if (code.includes('FORBIDDEN') || code.includes('ACCESS_DENIED') || code.includes('TENANT_ACCESS_DENIED') || code.includes('INSUFFICIENT_PERMISSIONS')) {
      status = 403;
    }

    return { response, status };
  }

  /**
   * リクエストIDを生成
   */
  private static generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}



