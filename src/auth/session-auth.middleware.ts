/**
 * Cookie + Redis セッション認証ミドルウェア
 * SSOT準拠: SSOT_SAAS_ADMIN_AUTHENTICATION.md
 *
 * 目的：
 * - JWT依存からCookie+Redisセッション認証への段階移行
 * - hotel-saas との Cookie 認証統一
 *
 * Cookie互換性：
 * - hotel_session（正式）
 * - hotel-session-id（暫定・互換期間のみ）
 *
 * Redisキー形式：
 * - hotel:session:{sessionId}
 *
 * フロー：
 * 1. Cookie から sessionId 取得（互換対応）
 * 2. Redis から session 取得
 * 3. req.user に tenant_id, user_id 等を設定
 * 4. 下流の権限・tenant分離ミドルウェアで利用
 */


import { HotelLogger } from '../utils/logger';
import { getRedisClient } from '../utils/redis';
import { StandardResponseBuilder } from '../utils/response-builder';

import type { NextFunction, Request, Response } from 'express';

const logger = HotelLogger.getInstance();

/**
 * Cookie名の互換対応
 * - 正式: hotel_session
 * - 暫定: hotel-session-id（移行期間のみ）
 */
function extractSessionIdFromCookies(req: Request): string | null {
  const cookies = req.headers.cookie;
  console.log('[session-auth] Cookie header:', cookies);
  if (!cookies) return null;

  // Cookie文字列をパース
  const cookieMap: Record<string, string> = {};
  cookies.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      cookieMap[key] = value;
    }
  });

  console.log('[session-auth] Parsed cookies:', cookieMap);
  // 正式Cookie名を優先
  const sessionId = cookieMap['hotel_session'] || cookieMap['hotel-session-id'] || null;
  console.log('[session-auth] Extracted sessionId:', sessionId);
  return sessionId;
}

/**
 * セッション認証ミドルウェア
 *
 * 処理順序：
 * 1. Cookie取得
 * 2. Redis照会
 * 3. req.user設定
 * 4. 下流へ
 */
export const sessionAuthMiddleware = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  // Phase 0: 入口ログ
  console.log('[session-auth] invoked', {
    path: req.path,
    cookie: (req.headers.cookie || '').slice(0, 80)
  });

  try {
    // 1. Cookie から sessionId 取得
    const sessionId = extractSessionIdFromCookies(req);

    if (!sessionId) {
      logger.warn('セッション認証失敗: Cookieなし', { path: req.path });
      return res.status(401).json(
        StandardResponseBuilder.error('UNAUTHORIZED', 'Authentication cookie is required').response
      );
    }

    // 2. Redis から session 取得
    const redis = getRedisClient();
    const sessionInfo = await redis.getSessionById(sessionId);

    if (!sessionInfo) {
      logger.warn('セッション認証失敗: セッション無効または期限切れ', {
        sessionId: sessionId.substring(0, 10) + '...',
        path: req.path
      });
      return res.status(401).json(
        StandardResponseBuilder.error('SESSION_EXPIRED', 'Session is invalid or expired').response
      );
    }

    // 3. req.user に設定（下流の権限・tenant分離ミドルウェアで使用）
    // SessionInfo型は最小限の情報のみ含むため、追加情報はRedis JSONから取得
    const sessionData = sessionInfo as any;
    req.user = {
      user_id: sessionInfo.user_id,
      tenant_id: sessionInfo.tenant_id,
      email: sessionData.email || 'unknown',
      role: sessionData.role || 'staff',
      permissions: sessionData.permissions || [],
      sessionId: sessionId,
      // 下流での accessible_tenants 検証用
      accessible_tenants: [sessionInfo.tenant_id]
    };

    logger.info('セッション認証成功', {
      user_id: sessionInfo.user_id,
      tenant_id: sessionInfo.tenant_id,
      path: req.path
    });

    // 4. 下流へ
    next();
  } catch (error: Error) {
    logger.error('セッション認証エラー', error);
    return res.status(500).json(
      StandardResponseBuilder.error('AUTH_ERROR', 'Authentication service error').response
    );
  }
};

