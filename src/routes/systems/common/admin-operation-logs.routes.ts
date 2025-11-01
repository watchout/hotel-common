import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../../auth/middleware';
import { hotelDb } from '../../../database';
import { ResponseHelper } from '../../../standards/api-response-standards';
import { StandardResponseBuilder } from '../../../standards/api-standards';
import { HotelLogger } from '../../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();
const logger = HotelLogger.getInstance();

/**
 * 管理者操作ログクエリスキーマ
 */
const AdminLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(20),
  user_id: z.string().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['COMPLETED', 'FAILED', 'PENDING']).optional()
});

/**
 * 管理者 - 操作ログ一覧取得
 * GET /api/v1/admin/operation-logs
 */
router.get('/operation-logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = AdminLogQuerySchema.parse(req.query);
    const { page, limit, user_id, action, entity_type, start_date, end_date, status } = query;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
    }

    // 実際のシステムイベントログを取得
    const whereConditions: any = {
      tenant_id: tenantId
    };

    if (user_id) {
      whereConditions.user_id = user_id;
    }

    if (action) {
      whereConditions.action = {
        contains: action,
        mode: 'insensitive'
      };
    }

    if (entity_type) {
      whereConditions.entity_type = entity_type;
    }

    if (status) {
      whereConditions.status = status;
    }

    if (start_date) {
      whereConditions.created_at = {
        ...whereConditions.created_at,
        gte: new Date(start_date)
      };
    }

    if (end_date) {
      whereConditions.created_at = {
        ...whereConditions.created_at,
        lte: new Date(end_date)
      };
    }

    const offset = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      hotelDb.getAdapter().systemEvent.findMany({
        where: whereConditions,
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),
      hotelDb.getAdapter().systemEvent.count({
        where: whereConditions
      })
    ]);

    const pagination = {
      page,
      limit,
      total_items: totalCount,
      total_pages: Math.ceil(totalCount / limit),
      has_next: offset + limit < totalCount,
      has_prev: page > 1
    };

    // ログデータを管理者向けに整形
    const toActionLabel = (action?: string) => {
      switch ((action || '').toUpperCase()) {
        case 'CHECKIN':
          return 'チェックイン'
        case 'CHECKOUT':
          return 'チェックアウト'
        case 'UPDATE_STATUS':
          return '状態更新'
        case 'RESERVATION_CREATE':
          return '予約作成'
        case 'RESERVATION_UPDATE':
          return '予約更新'
        case 'RESERVATION_CANCEL':
          return '予約キャンセル'
        default:
          return action || ''
      }
    }

    const formattedLogs = logs.map(log => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      action_label: toActionLabel(log.action),
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      event_type: log.event_type,
      source_system: log.source_system,
      target_system: log.target_system,
      status: log.status,
      event_data: log.event_data,
      created_at: log.created_at,
      processed_at: log.processed_at
    }));

    // サマリー情報
    const summary = {
      total_logs: totalCount,
      by_status: {
        completed: logs.filter(log => log.status === 'COMPLETED').length,
        failed: logs.filter(log => log.status === 'FAILED').length,
        pending: logs.filter(log => log.status === 'PENDING').length
      },
      by_event_type: logs.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_system: logs.reduce((acc, log) => {
        acc[log.source_system] = (acc[log.source_system] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    ResponseHelper.sendSuccess(res, {
      logs: formattedLogs,
      summary
    }, 200, pagination);

    logger.info('管理者操作ログ一覧取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      query_params: query,
      result_count: formattedLogs.length
    });

  } catch (error: unknown) {
    logger.error('管理者操作ログ一覧取得エラー', error as Error);

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors);
      return;
    }

    ResponseHelper.sendInternalError(res, '操作ログ一覧の取得に失敗しました');
  }
});

/**
 * 管理者 - 操作ログ詳細取得
 * GET /api/v1/admin/operation-logs/:id
 */
router.get('/operation-logs/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const logId = req.params.id;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
    }

    const log = await hotelDb.getAdapter().systemEvent.findFirst({
      where: {
        id: logId,
        tenant_id: tenantId
      }
    });

    if (!log) {
      ResponseHelper.sendNotFound(res, '指定された操作ログが見つかりません');
      return;
    }

    const detailedLog = {
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      event_type: log.event_type,
      source_system: log.source_system,
      target_system: log.target_system,
      status: log.status,
      event_data: log.event_data,
      created_at: log.created_at,
      processed_at: log.processed_at,
      // 追加の詳細情報
      metadata: {
        ip_address: (log.event_data as any)?.ip_address,
        user_agent: (log.event_data as any)?.user_agent,
        session_id: (log.event_data as any)?.session_id
      }
    };

    ResponseHelper.sendSuccess(res, { log: detailedLog });

    logger.info('管理者操作ログ詳細取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      log_id: logId
    });

  } catch (error: unknown) {
    logger.error('管理者操作ログ詳細取得エラー', error as Error);
    ResponseHelper.sendInternalError(res, '操作ログ詳細の取得に失敗しました');
  }
});

/**
 * 管理者 - 操作ログ統計取得
 * GET /api/v1/admin/operation-logs/stats
 */
router.get('/operation-logs/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
    }

    // 期間の計算
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const logs = await hotelDb.getAdapter().systemEvent.findMany({
      where: {
        tenant_id: tenantId,
        created_at: {
          gte: startDate
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // 統計データの計算
    const stats = {
      period: period as string,
      total_operations: logs.length,
      successful_operations: logs.filter(log => log.status === 'COMPLETED').length,
      failed_operations: logs.filter(log => log.status === 'FAILED').length,
      by_event_type: logs.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_action: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_user: logs.reduce((acc, log) => {
        if (log.user_id) {
          acc[log.user_id] = (acc[log.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      daily_breakdown: [] as any[] // 実装時に日別の集計を追加
    };

    ResponseHelper.sendSuccess(res, { stats });

    logger.info('管理者操作ログ統計取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      period,
      total_logs: logs.length
    });

  } catch (error: unknown) {
    logger.error('管理者操作ログ統計取得エラー', error as Error);
    ResponseHelper.sendInternalError(res, '操作ログ統計の取得に失敗しました');
  }
});

export default router;
