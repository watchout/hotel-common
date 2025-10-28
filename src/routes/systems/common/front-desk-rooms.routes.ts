import express from 'express';
import { z } from 'zod';

import { sessionAuthMiddleware } from '../../../auth/session-auth.middleware';
import { hotelDb } from '../../../database';
import { broadcastRoomOperation } from '../../../events/room-operation-broadcaster';
import { ResponseHelper, StandardResponseBuilder } from '../../../standards/api-response-standards';
import { HotelLogger } from '../../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();
const logger = HotelLogger.getInstance();

/**
 * 客室一覧取得スキーマ
 */
const RoomQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(20),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
  room_type: z.string().optional(),
  floor: z.coerce.number().optional()
});

/**
 * 客室更新スキーマ
 */
const RoomUpdateSchema = z.object({
  status: z.string().transform(s => s.toLowerCase()).pipe(z.enum(['available', 'occupied', 'maintenance', 'cleaning'])),
  notes: z.string().optional(),
  maintenance_reason: z.string().optional()
});

/**
 * フロントデスク - 客室一覧取得
 * GET /api/v1/admin/front-desk/rooms
 */
router.get('/rooms', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const query = RoomQuerySchema.parse(req.query);
    const { page, limit, status, room_type, floor } = query;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
      return;
    }

    // データベースから客室データを取得
    const whereClause: any = {
      tenantId,
      isDeleted: false
    };

    if (status) whereClause.status = status;
    if (room_type) whereClause.roomType = room_type;
    if (floor) whereClause.floor = floor;

    const [totalCount, rooms] = await Promise.all([
      hotelDb.getAdapter().room.count({ where: whereClause }),
      hotelDb.getAdapter().room.findMany({
        where: whereClause,
        orderBy: { roomNumber: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    // レスポンス形式に変換
    const paginatedRooms = rooms.map(room => ({
      id: room.id,
      room_number: room.roomNumber,
      room_type: room.roomType,
      floor: room.floor,
      status: room.status,
      capacity: room.capacity,
      amenities: room.amenities,
      notes: room.notes,
      last_cleaned: room.lastCleaned,
      created_at: room.createdAt,
      updatedAt: room.updatedAt
    }));

    const pagination = StandardResponseBuilder.createPagination(page, limit, totalCount);

    // サマリー情報を計算
    const [statusCounts, typeCounts] = await Promise.all([
      hotelDb.getAdapter().room.groupBy({
        by: ['status'],
        where: { tenantId, isDeleted: false },
        _count: { status: true }
      }),
      hotelDb.getAdapter().room.groupBy({
        by: ['roomType'],
        where: { tenantId, isDeleted: false },
        _count: { roomType: true }
      })
    ]);

    const byStatus = {
      available: statusCounts.find(s => s.status === 'available')?._count?.status || 0,
      occupied: statusCounts.find(s => s.status === 'occupied')?._count?.status || 0,
      maintenance: statusCounts.find(s => s.status === 'maintenance')?._count?.status || 0,
      cleaning: statusCounts.find(s => s.status === 'cleaning')?._count?.status || 0
    };

    const byType = {
      standard: typeCounts.find(t => t.roomType === 'standard')?._count?.roomType || 0,
      deluxe: typeCounts.find(t => t.roomType === 'deluxe')?._count?.roomType || 0,
      suite: typeCounts.find(t => t.roomType === 'suite')?._count?.roomType || 0
    };

    ResponseHelper.sendSuccess(res, {
      rooms: paginatedRooms,
      summary: {
        total_rooms: totalCount,
        by_status: byStatus,
        by_type: byType
      }
    }, 200, pagination);

    logger.info('フロントデスク客室一覧取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      query_params: query,
      result_count: paginatedRooms.length
    });

  } catch (error: unknown) {
    logger.error('フロントデスク客室一覧取得エラー', error as Error);

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors);
      return;
    }

    ResponseHelper.sendInternalError(res, '客室一覧の取得に失敗しました');
  }
});

/**
 * フロントデスク - 客室詳細取得
 * GET /api/v1/admin/front-desk/rooms/:id
 */
router.get('/rooms/:id', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です')
      );
      return;
    }

    // データベースから客室詳細を取得
    const room = await hotelDb.getAdapter().room.findFirst({
      where: {
        id: roomId,
        tenantId,
        isDeleted: false
      }
    });

    if (!room) {
      ResponseHelper.sendNotFound(res, '指定された客室が見つかりません');
      return;
    }

    // レスポンス形式に変換
    const roomDetail = {
      id: room.id,
      room_number: room.roomNumber,
      room_type: room.roomType,
      floor: room.floor,
      status: room.status,
      capacity: room.capacity,
      amenities: room.amenities,
      notes: room.notes,
      last_cleaned: room.lastCleaned,
      maintenance_history: [], // TODO: 将来的にメンテナンス履歴テーブルから取得
      current_guest: null, // TODO: 将来的に現在の宿泊者情報を取得
      created_at: room.createdAt,
      updatedAt: room.updatedAt
    };

    ResponseHelper.sendSuccess(res, { room: roomDetail });

    logger.info('フロントデスク客室詳細取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      room_id: roomId
    });

  } catch (error: unknown) {
    logger.error('フロントデスク客室詳細取得エラー', error as Error);
    ResponseHelper.sendInternalError(res, '客室詳細の取得に失敗しました');
  }
});

/**
 * フロントデスク - 客室状態更新
 * PUT /api/v1/admin/front-desk/rooms/:id
 */
router.put('/rooms/:id', sessionAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const updateData = RoomUpdateSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です')
      );
      return;
    }

    // 現在の客室情報を取得（更新前の状態を記録するため）
    const currentRoom = await hotelDb.getAdapter().room.findFirst({
      where: {
        id: roomId,
        tenantId,
        isDeleted: false
      }
    });

    if (!currentRoom) {
      ResponseHelper.sendNotFound(res, '指定された客室が見つかりません');
      return;
    }

    // 客室状態を実際に更新
    const updatedRoom = await hotelDb.getAdapter().room.update({
      where: {
        id: roomId
      },
      data: {
        status: updateData.status.toLowerCase(),
        notes: updateData.notes || currentRoom.notes,
        updatedAt: new Date()
      }
    });

    // システムイベントログ記録
    await hotelDb.getAdapter().systemEvent.create({
      data: {
        id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        tenant_id: tenantId,
        user_id: (req as any).user?.user_id,
        event_type: 'ROOM_MANAGEMENT',
        source_system: 'hotel-common',
        target_system: 'hotel-common',
        entity_type: 'room',
        entity_id: roomId,
        action: 'UPDATE_STATUS',
        event_data: {
          room_id: roomId,
          room_number: currentRoom.roomNumber,
          old_status: currentRoom.status,
          new_status: updateData.status,
          notes: updateData.notes,
          maintenance_reason: updateData.maintenance_reason,
          timestamp: new Date().toISOString()
        },
        status: 'COMPLETED'
      }
    });

    // WS配信（room.operation）
    try {
      await broadcastRoomOperation({
        tenant_id: tenantId,
        room_id: roomId,
        room_number: currentRoom.roomNumber,
        action: 'UPDATE_STATUS',
        details: {
          old_status: currentRoom.status,
          new_status: updatedRoom.status,
          notes: updateData.notes
        }
      })
    } catch { }

    // レスポンス形式に変換
    const responseRoom = {
      id: updatedRoom.id,
      room_number: updatedRoom.roomNumber,
      room_type: updatedRoom.roomType,
      floor: updatedRoom.floor,
      status: updatedRoom.status,
      capacity: updatedRoom.capacity,
      amenities: updatedRoom.amenities,
      notes: updatedRoom.notes,
      maintenance_reason: updateData.maintenance_reason,
      updatedAt: updatedRoom.updatedAt,
      updated_by: (req as any).user?.user_id
    };

    ResponseHelper.sendSuccess(res, {
      room: responseRoom,
      message: '客室状態を更新しました'
    });

    logger.info('フロントデスク客室状態更新完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      room_id: roomId,
      old_status: currentRoom.status,
      new_status: updateData.status
    });

  } catch (error: unknown) {
    logger.error('フロントデスク客室状態更新エラー', error as Error);

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, '更新データが正しくありません', error.errors);
      return;
    }

    ResponseHelper.sendInternalError(res, '客室状態の更新に失敗しました');
  }
});

export default router;
