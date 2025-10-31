/**
 * Google Playアプリ選択機能のユーティリティ関数
 */

import type { Request } from 'express';

// Expressのリクエスト型を拡張してuserプロパティを追加
declare global {
  namespace Express {
    interface Request {
      // @ts-expect-error - 型の互換性の問題
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
export const getTenantIdFromRequest = (req: Request): string | null => {
  if (req.user) {
    // tenantIdとtenant_idの両方をチェック（互換性のため）
    if ('tenantId' in req.user) {
      return req.user.tenantId as string;
    }
    if ('tenant_id' in req.user) {
      return req.user.tenant_id as string;
    }
  }
  return null;
};

/**
 * ページネーションパラメータを解析
 */
export const parsePaginationParams = (req: Request) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit))
  };
};

/**
 * ブール値クエリパラメータを解析
 */
export const parseBooleanParam = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined;
  return value === 'true' || value === '1';
};

/**
 * 数値パラメータを解析
 */
export const parseNumberParam = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = parseInt(value);
  return isNaN(parsed) ? undefined : parsed;
};