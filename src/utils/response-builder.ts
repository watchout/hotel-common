/**
 * 標準レスポンスビルダー
 * APIレスポンスの統一フォーマットを提供します
 */
import type { Response } from 'express';

interface StandardResponse {
  success: boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
  };
  meta?: {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    page?: number;
    limit?: number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    total?: number;
    has_next?: boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  timestamp: string;
  request_id?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}

export class StandardResponseBuilder {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * 成功レスポンスを作成
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  static success(res: Response, data: any = {}, meta: any = {}, statusCode = 200): Response {
    const response: StandardResponse = {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
      request_id: res.locals.requestId || this.generateRequestId()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    };

    return res.status(statusCode).json(response);
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
   * エラーレスポンスを作成
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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



