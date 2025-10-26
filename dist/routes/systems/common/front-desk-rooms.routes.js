"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const session_auth_middleware_1 = require("../../../auth/session-auth.middleware");
const database_1 = require("../../../database");
const room_operation_broadcaster_1 = require("../../../events/room-operation-broadcaster");
const api_response_standards_1 = require("../../../standards/api-response-standards");
const logger_1 = require("../../../utils/logger");
const router = express_1.default.Router();
const logger = logger_1.HotelLogger.getInstance();
/**
 * 客室一覧取得スキーマ
 */
const RoomQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(1000).default(20),
    status: zod_1.z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
    room_type: zod_1.z.string().optional(),
    floor: zod_1.z.coerce.number().optional()
});
/**
 * 客室更新スキーマ
 */
const RoomUpdateSchema = zod_1.z.object({
    status: zod_1.z.string().transform(s => s.toLowerCase()).pipe(zod_1.z.enum(['available', 'occupied', 'maintenance', 'cleaning'])),
    notes: zod_1.z.string().optional(),
    maintenance_reason: zod_1.z.string().optional()
});
/**
 * フロントデスク - 客室一覧取得
 * GET /api/v1/admin/front-desk/rooms
 */
router.get('/rooms', session_auth_middleware_1.sessionAuthMiddleware, async (req, res) => {
    try {
        const query = RoomQuerySchema.parse(req.query);
        const { page, limit, status, room_type, floor } = query;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
            return;
        }
        // データベースから客室データを取得
        const whereClause = {
            tenantId,
            isDeleted: false
        };
        if (status)
            whereClause.status = status;
        if (room_type)
            whereClause.roomType = room_type;
        if (floor)
            whereClause.floor = floor;
        const [totalCount, rooms] = await Promise.all([
            database_1.hotelDb.getAdapter().room.count({ where: whereClause }),
            database_1.hotelDb.getAdapter().room.findMany({
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
        const pagination = api_response_standards_1.StandardResponseBuilder.createPagination(page, limit, totalCount);
        // サマリー情報を計算
        const [statusCounts, typeCounts] = await Promise.all([
            database_1.hotelDb.getAdapter().room.groupBy({
                by: ['status'],
                where: { tenantId, isDeleted: false },
                _count: { status: true }
            }),
            database_1.hotelDb.getAdapter().room.groupBy({
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
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            rooms: paginatedRooms,
            summary: {
                total_rooms: totalCount,
                by_status: byStatus,
                by_type: byType
            }
        }, 200, pagination);
        logger.info('フロントデスク客室一覧取得完了', {
            user_id: req.user?.user_id,
            tenant_id: tenantId,
            query_params: query,
            result_count: paginatedRooms.length
        });
    }
    catch (error) {
        logger.error('フロントデスク客室一覧取得エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '客室一覧の取得に失敗しました');
    }
});
/**
 * フロントデスク - 客室詳細取得
 * GET /api/v1/admin/front-desk/rooms/:id
 */
router.get('/rooms/:id', session_auth_middleware_1.sessionAuthMiddleware, async (req, res) => {
    try {
        const roomId = req.params.id;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です'));
            return;
        }
        // データベースから客室詳細を取得
        const room = await database_1.hotelDb.getAdapter().room.findFirst({
            where: {
                id: roomId,
                tenantId,
                isDeleted: false
            }
        });
        if (!room) {
            api_response_standards_1.ResponseHelper.sendNotFound(res, '指定された客室が見つかりません');
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
        api_response_standards_1.ResponseHelper.sendSuccess(res, { room: roomDetail });
        logger.info('フロントデスク客室詳細取得完了', {
            user_id: req.user?.user_id,
            tenant_id: tenantId,
            room_id: roomId
        });
    }
    catch (error) {
        logger.error('フロントデスク客室詳細取得エラー', error);
        api_response_standards_1.ResponseHelper.sendInternalError(res, '客室詳細の取得に失敗しました');
    }
});
/**
 * フロントデスク - 客室状態更新
 * PUT /api/v1/admin/front-desk/rooms/:id
 */
router.put('/rooms/:id', session_auth_middleware_1.sessionAuthMiddleware, async (req, res) => {
    try {
        const roomId = req.params.id;
        const updateData = RoomUpdateSchema.parse(req.body);
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です'));
            return;
        }
        // 現在の客室情報を取得（更新前の状態を記録するため）
        const currentRoom = await database_1.hotelDb.getAdapter().room.findFirst({
            where: {
                id: roomId,
                tenantId,
                isDeleted: false
            }
        });
        if (!currentRoom) {
            api_response_standards_1.ResponseHelper.sendNotFound(res, '指定された客室が見つかりません');
            return;
        }
        // 客室状態を実際に更新
        const updatedRoom = await database_1.hotelDb.getAdapter().room.update({
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
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                tenant_id: tenantId,
                user_id: req.user?.user_id,
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
            await (0, room_operation_broadcaster_1.broadcastRoomOperation)({
                tenant_id: tenantId,
                room_id: roomId,
                room_number: currentRoom.roomNumber,
                action: 'UPDATE_STATUS',
                details: {
                    old_status: currentRoom.status,
                    new_status: updatedRoom.status,
                    notes: updateData.notes
                }
            });
        }
        catch { }
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
            updated_by: req.user?.user_id
        };
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            room: responseRoom,
            message: '客室状態を更新しました'
        });
        logger.info('フロントデスク客室状態更新完了', {
            user_id: req.user?.user_id,
            tenant_id: tenantId,
            room_id: roomId,
            old_status: currentRoom.status,
            new_status: updateData.status
        });
    }
    catch (error) {
        logger.error('フロントデスク客室状態更新エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, '更新データが正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '客室状態の更新に失敗しました');
    }
});
exports.default = router;
