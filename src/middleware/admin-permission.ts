/**
 * 管理者権限チェックミドルウェア
 * baseLevelベースの権限管理（既存roleフィールドから計算）
 */


import { HotelLogger } from '../utils/logger';
import { StandardResponseBuilder } from '../utils/response-builder';
import { getRoleLevel } from '../utils/staff-helpers';

import type { Request, Response, NextFunction } from 'express';

const logger = HotelLogger.getInstance();

/**
 * 管理者権限レベルチェックミドルウェア
 */
export const requireAdminLevel = (requiredLevel: number) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      // 認証チェック
      if (!req.user) {
        return res.status(401).json(
          StandardResponseBuilder.error('UNAUTHORIZED', '認証が必要です').response
        );
      }

      // ユーザーの権限レベル取得
      const userRole = req.user.role || 'staff';
      const userLevel = getRoleLevel(userRole);
      
      logger.debug('Admin permission check', {
        userId: req.user.user_id,
        userRole,
        userLevel,
        requiredLevel,
        path: req.path
      });

      // 権限レベルチェック
      if (userLevel < requiredLevel) {
        logger.warn('Insufficient admin permissions', {
          userId: req.user.user_id,
          userRole,
          userLevel,
          requiredLevel,
          path: req.path
        });
        
        return res.status(403).json(
          StandardResponseBuilder.error(
            'INSUFFICIENT_PERMISSIONS',
            `管理者権限（レベル${requiredLevel}以上）が必要です。現在のレベル: ${userLevel}`
          ).response
        );
      }

      // 権限チェック通過
      logger.info('Admin permission granted', {
        userId: req.user.user_id,
        userLevel,
        requiredLevel,
        path: req.path
      });

      next();
    } catch (error) {
      logger.error('Admin permission check error', error);
      return res.status(500).json(
        StandardResponseBuilder.error(
          'PERMISSION_CHECK_ERROR',
          '権限チェック中にエラーが発生しました'
        ).response
      );
    }
  };
};

/**
 * スタッフ管理権限チェック（レベル3以上）
 */
export const requireStaffManagementPermission = requireAdminLevel(3);

/**
 * スタッフ作成・削除権限チェック（レベル4以上）
 */
export const requireStaffAdminPermission = requireAdminLevel(4);

/**
 * システム管理権限チェック（レベル5）
 */
export const requireSystemAdminPermission = requireAdminLevel(5);

/**
 * 自分より上位レベルのスタッフ操作を防ぐミドルウェア
 */
export const preventHigherLevelStaffOperation = () => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    // このミドルウェアは個別スタッフ操作時に使用
    // 実際のレベルチェックは各エンドポイント内で実装
    next();
  };
};

/**
 * テナント管理者権限チェック
 */
export const requireTenantAdmin = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  if (!req.user?.tenant_id) {
    return res.status(400).json(
      StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
    );
  }
  
  const userLevel = getRoleLevel(req.user.role || 'staff');
  if (userLevel < 3) {
    return res.status(403).json(
      StandardResponseBuilder.error(
        'TENANT_ADMIN_REQUIRED',
        'テナント管理者権限が必要です'
      ).response
    );
  }
  
  next();
};
