/**
 * 操作ログ機能 - 共用API
 * 全システム共通の操作ログ管理
 */

import express from 'express'
import NodeCache from 'node-cache'
import { z } from 'zod'

import { sessionAuthMiddleware } from '../../../auth/session-auth.middleware'
import { hotelDb } from '../../../database'
import { broadcastRoomOperation } from '../../../events/room-operation-broadcaster'
import { ResponseHelper, StandardResponseBuilder } from '../../../standards/api-response-standards'
import { HotelLogger } from '../../../utils/logger'

import type { Request, Response } from 'express';

const router = express.Router()
const logger = HotelLogger.getInstance()

// v2.0: 詳細アクションホワイトリスト（段階的厳格化）
const ACTION_WHITELIST = new Set<string>([
  // v1.0 互換
  'CHECKIN', 'CHECKOUT', 'UPDATE_STATUS', 'RESERVATION_CREATE', 'RESERVATION_UPDATE', 'RESERVATION_CANCEL',
  // v2.0 詳細
  'ROOM_CLEANING_START', 'ROOM_CLEANING_COMPLETE', 'ROOM_CLEANING_INSPECTION', 'ROOM_CLEANING_FAILED',
  'ROOM_MAINTENANCE_START', 'ROOM_MAINTENANCE_COMPLETE', 'ROOM_REPAIR_REQUEST', 'ROOM_REPAIR_COMPLETE',
  'ROOM_BLOCK', 'ROOM_UNBLOCK', 'ROOM_OUT_OF_ORDER', 'ROOM_BACK_IN_SERVICE',
  'ROOM_INSPECTION', 'ROOM_SETUP_COMPLETE', 'ROOM_AMENITY_RESTOCK', 'ROOM_DEEP_CLEANING',
  'ROOM_STATUS_SYNC', 'ROOM_BULK_UPDATE'
])

// 段階的厳格化の施行日（以降は未知actionで400）
const STRICT_ACTION_ENFORCE_AT = process.env.LOG_SCHEMA_STRICT_FROM ? new Date(process.env.LOG_SCHEMA_STRICT_FROM) : null

// v2.0 event_data スキーマ（room対象時の必須）
const RoomEventDataSchema = z.object({
  room_id: z.string(),
  room_number: z.string(),
  old_status: z.string(),
  new_status: z.string(),
  timestamp: z.string(),
  triggered_by_system: z.enum(['hotel-saas', 'hotel-pms', 'hotel-member', 'hotel-common']),
  operation_category: z.enum(['cleaning', 'maintenance', 'guest_service', 'system', 'emergency']),
  staff_id: z.string()
}).passthrough()

// 受信重複排除用（暫定・プロセス内）
const idemCache = new NodeCache({ stdTTL: 60 * 10, checkperiod: 60 })

const normalizeStatus = (s?: string) => (s || '').toString().toLowerCase()

// バリデーションスキーマ
const OperationLogSchema = z.object({
  // 既存クライアント互換: action もしくは type のどちらかが来る
  action: z.string().min(1).max(100).optional(),
  type: z
    .enum(['CHECKIN', 'CHECKOUT', 'UPDATE_STATUS', 'RESERVATION_CREATE', 'RESERVATION_UPDATE', 'RESERVATION_CANCEL'])
    .optional(),
  target_type: z.string().optional(),
  target_id: z.string().optional(),
  details: z.any().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional()
}).refine((data) => Boolean(data.action || data.type), {
  message: 'Either action or type is required',
  path: ['action']
})

const OperationLogQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  action: z.string().optional(),
  target_type: z.string().optional(),
  user_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  system: z.enum(['hotel-saas', 'hotel-pms', 'hotel-member', 'hotel-common']).optional()
})

/**
 * 操作ログ一覧取得
 * GET /api/v1/logs/operations
 */
console.log('[DEBUG] Registering GET /operations with sessionAuthMiddleware:', typeof sessionAuthMiddleware);
const wrappedSessionAuth = (req: Request, res: Response, next: any) => {
  console.log('[WRAPPER] Before calling sessionAuthMiddleware');
  return sessionAuthMiddleware(req, res, next);
};
router.get('/operations', wrappedSessionAuth, async (req: Request, res: Response) => {
  try {
    const query = OperationLogQuerySchema.parse(req.query)
    const { page, limit, action, target_type, user_id, start_date, end_date, system } = query

    // クエリ条件構築
    const where: any = {
      tenant_id: req.user?.tenant_id
    }

    if (action) where.action = { contains: action }
    if (target_type) where.target_type = target_type
    if (user_id) where.user_id = user_id
    if (system) where.source_system = system

    if (start_date || end_date) {
      where.created_at = {}
      if (start_date) where.created_at.gte = new Date(start_date)
      if (end_date) where.created_at.lte = new Date(end_date)
    }

    // データ取得
    const [logs, totalCount] = await Promise.all([
      hotelDb.getAdapter().systemEvent.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          user_id: true,
          event_type: true,
          source_system: true,
          target_system: true,
          entity_type: true,
          entity_id: true,
          action: true,
          event_data: true,
          created_at: true,
          status: true
        }
      }),
      hotelDb.getAdapter().systemEvent.count({ where })
    ])

    // レスポンス構築
    const pagination = StandardResponseBuilder.createPagination(page, limit, totalCount)

    // アクションの日本語ラベル変換
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

    ResponseHelper.sendSuccess(res, {
      logs: logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        action_label: toActionLabel(log.action),
        target_type: log.entity_type,
        target_id: log.entity_id,
        system: log.source_system,
        details: log.event_data,
        created_at: log.created_at,
        status: log.status
      })),
      summary: {
        total_logs: totalCount,
        filtered_logs: logs.length
      }
    }, 200, pagination)

    logger.info('操作ログ一覧取得完了', {
      user_id: req.user?.user_id,
      tenant_id: req.user?.tenant_id,
      query_params: query,
      result_count: logs.length
    })

  } catch (error: unknown) {
    logger.error('操作ログ一覧取得エラー', error as Error)

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors)
      return
    }

    ResponseHelper.sendInternalError(res, '操作ログの取得に失敗しました')
  }
})

/**
 * 操作ログ詳細取得
 * GET /api/v1/logs/operations/:id
 */
router.get('/operations/:id', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const log = await hotelDb.getAdapter().systemEvent.findFirst({
      where: {
        id,
        tenant_id: req.user?.tenant_id
      }
    })

    if (!log) {
      ResponseHelper.sendNotFound(res, '指定された操作ログが見つかりません')
      return
    }

    ResponseHelper.sendSuccess(res, {
      id: log.id,
      tenant_id: log.tenant_id,
      user_id: log.user_id,
      event_type: log.event_type,
      source_system: log.source_system,
      target_system: log.target_system,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      action: log.action,
      event_data: log.event_data,
      created_at: log.created_at,
      processed_at: log.processed_at,
      status: log.status
    })

    logger.info('操作ログ詳細取得完了', {
      user_id: req.user?.user_id,
      tenant_id: req.user?.tenant_id,
      log_id: id
    })

  } catch (error: unknown) {
    logger.error('操作ログ詳細取得エラー', error as Error)
    ResponseHelper.sendInternalError(res, '操作ログの詳細取得に失敗しました')
  }
})

/**
 * 操作ログ記録
 * POST /api/v1/logs/operations
 */
router.post('/operations', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const logData = OperationLogSchema.parse(req.body)

    // 互換性: type があれば優先して action として扱う
    const effectiveAction = (logData.type || logData.action || '').toString().toUpperCase()

    // アクション厳格化（段階的）
    if (!ACTION_WHITELIST.has(effectiveAction)) {
      const now = new Date()
      if (STRICT_ACTION_ENFORCE_AT && now >= STRICT_ACTION_ENFORCE_AT) {
        return ResponseHelper.sendValidationError(res, '未知のactionが指定されました', [
          { path: ['action'], message: `Unknown action: ${effectiveAction}` }
        ])
      }
      logger.warn('未知のaction（受理・WARN）', { action: effectiveAction })
    }

    // event_data v2.0 検証（room 対象時のみ必須）
    let details: any = logData.details || {}
    if ((logData.target_type || '').toLowerCase() === 'room') {
      const parsed = RoomEventDataSchema.safeParse(details)
      if (!parsed.success) {
        // 段階的厳格化: まずはWARN、将来は400に移行可能
        logger.warn('event_data 構造がv2.0要件を満たしていません（受理）', { errors: parsed.error.issues })
      } else {
        details = parsed.data
      }

      // ステータス正規化（小文字）
      if (details.old_status) details.old_status = normalizeStatus(details.old_status)
      if (details.new_status) details.new_status = normalizeStatus(details.new_status)
    }

    // Idempotency（at-least-once + 重複排除）
    const correlationId = req.get('Idempotency-Key') || details.correlation_id
    if (correlationId) {
      const cacheKey = `oplog:${correlationId}`
      const cached = idemCache.get(cacheKey)
      if (cached) {
        return ResponseHelper.sendSuccess(res, {
          duplicate: true,
          correlation_id: correlationId,
          message: 'duplicated operation ignored'
        }, 200)
      }
      idemCache.set(cacheKey, true)
    }

    // システムイベントとして記録
    const systemEvent = await hotelDb.getAdapter().systemEvent.create({
      data: {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        tenant_id: req.user?.tenant_id!,
        user_id: req.user?.user_id,
        event_type: 'USER_OPERATION',
        source_system: 'hotel-common',
        target_system: 'hotel-common',
        entity_type: logData.target_type || 'unknown',
        entity_id: logData.target_id || 'unknown',
        action: effectiveAction,
        event_data: {
          action: effectiveAction,
          target_type: logData.target_type,
          target_id: logData.target_id,
          details,
          ip_address: logData.ip_address || req.ip,
          user_agent: logData.user_agent || req.get('User-Agent'),
          timestamp: new Date().toISOString()
        },
        status: 'COMPLETED'
      }
    })

    // WebSocket配信（room対象のみ）
    if ((logData.target_type || '').toLowerCase() === 'room') {
      const details: any = (systemEvent as any).event_data?.details || {}
      await broadcastRoomOperation({
        tenant_id: req.user?.tenant_id!,
        room_id: (details.room_id || logData.target_id || '').toString(),
        room_number: details.room_number,
        action: effectiveAction,
        details,
        correlation_id: details.correlation_id
      })
    }

    ResponseHelper.sendSuccess(res, {
      log_id: systemEvent.id,
      message: '操作ログを記録しました'
    }, 201)

    logger.info('操作ログ記録完了', {
      user_id: req.user?.user_id,
      tenant_id: req.user?.tenant_id,
      action: logData.action,
      log_id: systemEvent.id
    })

  } catch (error: unknown) {
    logger.error('操作ログ記録エラー', error as Error)

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, '操作ログデータが正しくありません', error.errors)
      return
    }

    ResponseHelper.sendInternalError(res, '操作ログの記録に失敗しました')
  }
})

/**
 * 操作ログ検索
 * POST /api/v1/logs/operations/search
 */
router.post('/operations/search', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const SearchSchema = z.object({
      query: z.string().min(1),
      filters: z.object({
        systems: z.array(z.string()).optional(),
        actions: z.array(z.string()).optional(),
        date_range: z.object({
          start: z.string(),
          end: z.string()
        }).optional()
      }).optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    })

    const searchData = SearchSchema.parse(req.body)
    const { query: searchQuery, filters, page, limit } = searchData

    // 検索条件構築
    const where: any = {
      tenant_id: req.user?.tenant_id,
      OR: [
        { action: { contains: searchQuery } },
        { entity_type: { contains: searchQuery } },
        { entity_id: { contains: searchQuery } }
      ]
    }

    if (filters?.systems?.length) {
      where.source_system = { in: filters.systems }
    }

    if (filters?.actions?.length) {
      where.action = { in: filters.actions }
    }

    if (filters?.date_range) {
      where.created_at = {
        gte: new Date(filters.date_range.start),
        lte: new Date(filters.date_range.end)
      }
    }

    // データ取得
    const [logs, totalCount] = await Promise.all([
      hotelDb.getAdapter().systemEvent.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      hotelDb.getAdapter().systemEvent.count({ where })
    ])

    const pagination = StandardResponseBuilder.createPagination(page, limit, totalCount)

    ResponseHelper.sendSuccess(res, {
      logs,
      search_summary: {
        query: searchQuery,
        total_results: totalCount,
        page_results: logs.length
      }
    }, 200, pagination)

    logger.info('操作ログ検索完了', {
      user_id: req.user?.user_id,
      tenant_id: req.user?.tenant_id,
      search_query: searchQuery,
      result_count: logs.length
    })

  } catch (error: unknown) {
    logger.error('操作ログ検索エラー', error as Error)

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, '検索条件が正しくありません', error.errors)
      return
    }

    ResponseHelper.sendInternalError(res, '操作ログの検索に失敗しました')
  }
})

/**
 * 操作ログエクスポート
 * GET /api/v1/logs/operations/export
 */
router.get('/operations/export', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const ExportQuerySchema = z.object({
      format: z.enum(['csv', 'json']).default('csv'),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      systems: z.string().optional().transform(val => val ? val.split(',') : undefined)
    })

    const query = ExportQuerySchema.parse(req.query)
    const { format, start_date, end_date, systems } = query

    // エクスポート条件構築
    const where: any = {
      tenant_id: req.user?.tenant_id
    }

    if (start_date || end_date) {
      where.created_at = {}
      if (start_date) where.created_at.gte = new Date(start_date)
      if (end_date) where.created_at.lte = new Date(end_date)
    }

    if (systems?.length) {
      where.source_system = { in: systems }
    }

    // データ取得（最大1000件）
    const logs = await hotelDb.getAdapter().systemEvent.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 1000
    })

    if (format === 'csv') {
      // CSV形式でエクスポート
      const csvHeader = 'ID,User ID,Action,Target Type,Target ID,System,Created At,Status\n'
      const csvData = logs.map(log =>
        `${log.id},${log.user_id || ''},${log.action},${log.entity_type},${log.entity_id},${log.source_system},${log.created_at.toISOString()},${log.status}`
      ).join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="operation-logs-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csvHeader + csvData)
    } else {
      // JSON形式でエクスポート
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="operation-logs-${new Date().toISOString().split('T')[0]}.json"`)
      res.json({
        export_info: {
          generated_at: new Date().toISOString(),
          total_records: logs.length,
          filters: { start_date, end_date, systems }
        },
        logs
      })
    }

    logger.info('操作ログエクスポート完了', {
      user_id: req.user?.user_id,
      tenant_id: req.user?.tenant_id,
      format,
      record_count: logs.length
    })

  } catch (error: unknown) {
    logger.error('操作ログエクスポートエラー', error as Error)

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, 'エクスポート条件が正しくありません', error.errors)
      return
    }

    ResponseHelper.sendInternalError(res, '操作ログのエクスポートに失敗しました')
  }
})

export default router
