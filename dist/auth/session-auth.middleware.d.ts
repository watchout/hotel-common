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
import type { NextFunction, Request, Response } from 'express';
/**
 * セッション認証ミドルウェア
 *
 * 処理順序：
 * 1. Cookie取得
 * 2. Redis照会
 * 3. req.user設定
 * 4. 下流へ
 */
export declare const sessionAuthMiddleware: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
