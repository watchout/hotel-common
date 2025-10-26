import express from 'express';

import { authMiddleware } from '../auth/middleware';
import SessionMigrationService from '../services/session-migration.service';
import { logger } from '../utils/logger';
import { StandardResponseBuilder } from '../utils/response-builder';

import type { Request, Response } from 'express';

const router = express.Router();

/**
 * 既存注文データの移行実行
 * POST /api/v1/session-migration/migrate-orders
 */
router.post('/migrate-orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    logger.info('既存注文データ移行開始', { tenantId });

    const result = await SessionMigrationService.migrateExistingOrders(tenantId);

    if (result.success) {
      return StandardResponseBuilder.success(res, {
        migratedCount: result.migratedCount,
        errors: result.errors
      }, { message: `${result.migratedCount}件の注文を正常に移行しました` });
    } else {
      return StandardResponseBuilder.success(res, {
        migratedCount: result.migratedCount,
        errors: result.errors
      }, { message: `${result.migratedCount}件を移行しましたが、${result.errors.length}件でエラーが発生しました` });
    }

    logger.info('既存注文データ移行完了', {
      tenantId,
      migratedCount: result.migratedCount,
      errorCount: result.errors.length
    });

  } catch (error: unknown) {
    logger.error('既存注文データ移行エラー', error as Error);
    const errorResponse = StandardResponseBuilder.error('INTERNAL_ERROR', '注文データの移行に失敗しました');
    return res.status(errorResponse.status).json(errorResponse.response);
  }
});

/**
 * セッション統計情報取得
 * GET /api/v1/session-migration/statistics
 */
router.get('/statistics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    const statistics = await SessionMigrationService.getSessionStatistics(tenantId);

    return StandardResponseBuilder.success(res, { statistics });

    logger.info('セッション統計情報取得完了', { tenantId, statistics });

  } catch (error: unknown) {
    logger.error('セッション統計情報取得エラー', error as Error);
    const errorResponse = StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション統計情報の取得に失敗しました');
    return res.status(errorResponse.status).json(errorResponse.response);
  }
});

/**
 * 後方互換性チェック
 * GET /api/v1/session-migration/compatibility-check
 */
router.get('/compatibility-check', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    const compatibility = await SessionMigrationService.checkBackwardCompatibility(tenantId);

    return StandardResponseBuilder.success(res, { compatibility });

    logger.info('後方互換性チェック完了', { tenantId, compatibility });

  } catch (error: unknown) {
    logger.error('後方互換性チェックエラー', error as Error);
    const errorResponse = StandardResponseBuilder.error('INTERNAL_ERROR', '後方互換性チェックに失敗しました');
    return res.status(errorResponse.status).json(errorResponse.response);
  }
});

/**
 * 移行状況レポート取得
 * GET /api/v1/session-migration/report
 */
router.get('/report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    const [statistics, compatibility] = await Promise.all([
      SessionMigrationService.getSessionStatistics(tenantId),
      SessionMigrationService.checkBackwardCompatibility(tenantId)
    ]);

    const report = {
      generatedAt: new Date(),
      tenantId,
      statistics,
      compatibility,
      migrationStatus: {
        isComplete: compatibility.isCompatible,
        completionRate: statistics.orders.mappingRate,
        pendingActions: compatibility.recommendations
      }
    };

    return StandardResponseBuilder.success(res, { report });

    logger.info('移行状況レポート取得完了', { tenantId });

  } catch (error: unknown) {
    logger.error('移行状況レポート取得エラー', error as Error);
    const errorResponse = StandardResponseBuilder.error('INTERNAL_ERROR', '移行状況レポートの取得に失敗しました');
    return res.status(errorResponse.status).json(errorResponse.response);
  }
});

export default router;
