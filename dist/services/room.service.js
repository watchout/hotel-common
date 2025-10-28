"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const prisma_1 = require("../database/prisma");
const logger_1 = require("../utils/logger");
/**
 * 部屋管理サービス
 * PMS基本機能の部屋管理
 */
class RoomService {
    static logger = logger_1.HotelLogger.getInstance();
    /**
     * 部屋作成
     */
    static async createRoom(data) {
        try {
            this.logger.info('部屋作成開始', {
                data: {
                    tenantId: data.tenant_id,
                    roomNumber: data.room_number,
                    roomType: data.room_type
                }
            });
            // 部屋番号の重複チェック
            const existingRoom = await prisma_1.hotelDb.getAdapter().room.findFirst({
                where: {
                    tenantId: data.tenant_id,
                    roomNumber: data.room_number
                }
            });
            if (existingRoom) {
                throw new Error(`部屋番号 ${data.room_number} は既に存在します`);
            }
            const room = await prisma_1.hotelDb.getAdapter().room.create({
                data: {
                    tenantId: data.tenant_id,
                    roomNumber: data.room_number,
                    roomType: data.room_type,
                    floor: data.floor_number,
                    capacity: data.capacity,
                    // baseRate: data.base_rate,
                    // roomGradeId: data.roomGradeId,
                    // room_size_sqm: data.room_size_sqm,
                    amenities: data.amenities,
                    // is_smoking: data.is_smoking,
                    // is_accessible: data.is_accessible,
                    // // bed_configuration: data.bed_configuration,
                    // bathroomType: data.bathroomType,
                    // // view_type: data.view_type,
                    // status: 'available',
                    // isActive: true,
                    notes: data.notes,
                    // createdBy: data.createdBy,
                    // createdBy_system: 'hotel-common'
                }
            });
            this.logger.info('部屋作成完了', {
                data: {
                    room_id: room.id,
                    roomNumber: data.room_number
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return room;
        }
        catch (error) {
            this.logger.error('部屋作成エラー', error);
            throw error;
        }
    }
    /**
     * 部屋取得（ID指定）
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async getRoomById(id, tenantId, includeGrade = false) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const include = {};
            if (includeGrade) {
                include.roomGrade = true;
            }
            const room = await prisma_1.hotelDb.getAdapter().room.findFirst({
                where: {
                    id,
                    tenantId: tenantId
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                },
                include
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return room;
        }
        catch (error) {
            this.logger.error('部屋取得エラー', error);
            throw error;
        }
    }
    /**
     * 部屋番号で取得
     */
    static async getRoomByNumber(roomNumber, tenantId) {
        try {
            const room = await prisma_1.hotelDb.getAdapter().room.findFirst({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                where: {
                    roomNumber: roomNumber,
                    tenantId: tenantId
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return room;
        }
        catch (error) {
            this.logger.error('部屋番号取得エラー', error);
            throw error;
        }
    }
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * 部屋一覧取得（検索・フィルタ対応）
     */
    static async getRooms(params) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where = {
                tenantId: params.tenant_id
            };
            // フィルタ条件構築
            if (params.status) {
                where.status = params.status;
            }
            if (params.room_type) {
                where.roomType = params.room_type;
            }
            if (params.floor_number) {
                where.floor_number = params.floor_number;
            }
            if (params.capacity_min || params.capacity_max) {
                where.capacity = {};
                if (params.capacity_min) {
                    where.capacity.gte = params.capacity_min;
                }
                if (params.capacity_max) {
                    where.capacity.lte = params.capacity_max;
                }
            }
            if (params.is_smoking !== undefined) {
                where.is_smoking = params.is_smoking;
            }
            if (params.is_accessible !== undefined) {
                where.is_accessible = params.is_accessible;
            }
            if (params.is_active !== undefined) {
                where.isActive = params.is_active;
            }
            if (params.room_grade_id) {
                where.roomGradeId = params.room_grade_id;
            }
            // 空室期間チェック（予約との重複確認）
            if (params.available_from && params.available_to) {
                where.NOT = {
                    reservations: {
                        some: {
                            AND: [
                                {
                                    checkin_date: {
                                        lt: new Date(params.available_to)
                                    }
                                },
                                {
                                    checkout_date: {
                                        gt: new Date(params.available_from)
                                    }
                                },
                                {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    status: {
                                        in: ['confirmed', 'checked_in']
                                    }
                                }
                            ]
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }
                    }
                };
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const include = {};
            if (params.include_grade) {
                include.roomGrade = true;
            }
            // 総件数取得
            const total = await prisma_1.hotelDb.getAdapter().room.count({ where });
            // データ取得
            const rooms = await prisma_1.hotelDb.getAdapter().room.findMany({
                where,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                include,
                orderBy: [
                    { floor: 'asc' },
                    { roomNumber: 'asc' }
                ],
                skip: params.offset,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                take: params.limit
            });
            const hasNext = params.offset + params.limit < total;
            return {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                rooms: rooms,
                total,
                hasNext
            };
        }
        catch (error) {
            this.logger.error('部屋一覧取得エラー', error);
            throw error;
        }
    }
    /**
     * 部屋更新
     */
    static async updateRoom(id, tenantId, data) {
        try {
            this.logger.info('部屋更新開始', {
                data: {
                    room_id: id,
                    tenantId: tenantId
                }
            });
            // 部屋番号の重複チェック（変更される場合）
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (data.room_number) {
                const existingRoom = await prisma_1.hotelDb.getAdapter().room.findFirst({
                    where: {
                        tenantId: tenantId,
                        roomNumber: data.room_number,
                        NOT: { id }
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                });
                if (existingRoom) {
                    throw new Error(`部屋番号 ${data.room_number} は既に存在します`);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData = {
                ...data,
                updatedAt: new Date(),
                // updatedBy_system: 'hotel-common'
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            };
            const room = await prisma_1.hotelDb.getAdapter().room.update({
                where: {
                    id,
                    tenantId: tenantId
                },
                data: updateData
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            });
            this.logger.info('部屋更新完了', {
                data: {
                    room_id: id
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return room;
        }
        catch (error) {
            this.logger.error('部屋更新エラー', error);
            throw error;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * 部屋ステータス更新
     */
    static async updateRoomStatus(id, tenantId, data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try {
            this.logger.info('部屋ステータス更新開始', {
                data: {
                    room_id: id,
                    tenantId: tenantId,
                    status: data.status
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData = {
                status: data.status,
                updatedAt: new Date(),
                // updatedBy: data.updated_by,
                // updatedBy_system: 'hotel-common'
            };
            if (data.notes) {
                updateData.notes = data.notes;
            }
            if (data.maintenance_notes) {
                updateData.maintenance_notes = data.maintenance_notes;
            }
            // ステータス別の追加処理
            if (data.status === 'cleaning') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                updateData.last_cleaned_at = new Date();
            }
            else if (data.status === 'maintenance') {
                updateData.last_maintenance_at = new Date();
            }
            const room = await prisma_1.hotelDb.getAdapter().room.update({
                where: {
                    id,
                    tenantId: tenantId
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: updateData
            });
            this.logger.info('部屋ステータス更新完了', {
                data: {
                    room_id: id,
                    status: data.status
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return room;
        }
        catch (error) {
            this.logger.error('部屋ステータス更新エラー', error);
            throw error;
        }
    }
    /**
     * 部屋削除（論理削除）
     */
    static async deleteRoom(id, tenantId, deletedBy) {
        try {
            this.logger.info('部屋削除開始', {
                data: {
                    room_id: id,
                    tenantId: tenantId
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            });
            const room = await prisma_1.hotelDb.getAdapter().room.update({
                where: {
                    id,
                    tenantId: tenantId
                },
                data: {
                    // isActive: false,
                    status: 'out_of_order',
                    updatedAt: new Date(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    // updatedBy: deletedBy,
                    // updatedBy_system: 'hotel-common'
                }
            });
            this.logger.info('部屋削除完了', {
                data: {
                    room_id: id
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return room;
        }
        catch (error) {
            this.logger.error('部屋削除エラー', error);
            throw error;
        }
    }
    /**
     * フロア別部屋取得
     */
    static async getRoomsByFloor(floorNumber, tenantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try {
            const rooms = await prisma_1.hotelDb.getAdapter().room.findMany({
                where: {
                    tenantId: tenantId,
                    floor: floorNumber,
                    // isActive: true
                },
                orderBy: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    roomNumber: 'asc'
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rooms;
        }
        catch (error) {
            this.logger.error('フロア別部屋取得エラー', error);
            throw error;
        }
    }
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * 空室検索
     */
    static async searchAvailableRooms(params) {
        try {
            this.logger.info('空室検索開始', {
                data: {
                    tenantId: params.tenant_id,
                    checkin_date: params.checkin_date,
                    checkout_date: params.checkout_date,
                    guest_count: params.guest_count
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where = {
                tenantId: params.tenant_id,
                // isActive: true,
                status: {
                    in: ['available', 'cleaning']
                },
                capacity: {
                    gte: params.guest_count
                }
            };
            // 部屋タイプフィルタ
            if (params.room_type) {
                where.roomType = params.room_type;
            }
            // 喫煙・禁煙フィルタ
            if (params.is_smoking !== undefined) {
                where.is_smoking = params.is_smoking;
            }
            // バリアフリーフィルタ
            if (params.is_accessible !== undefined) {
                where.is_accessible = params.is_accessible;
            }
            // 部屋グレードフィルタ
            if (params.room_grade_id) {
                where.roomGradeId = params.room_grade_id;
            }
            // 予約との重複チェック
            where.NOT = {
                reservations: {
                    some: {
                        AND: [
                            {
                                checkin_date: {
                                    lt: new Date(params.checkout_date)
                                }
                            },
                            {
                                checkout_date: {
                                    gt: new Date(params.checkin_date)
                                }
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            },
                            {
                                status: {
                                    in: ['confirmed', 'checked_in']
                                }
                            }
                        ]
                    }
                }
            };
            const rooms = await prisma_1.hotelDb.getAdapter().room.findMany({
                where,
                include: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                // roomGrade: true
                },
                orderBy: [
                    { floor: 'asc' },
                    { roomNumber: 'asc' }
                ]
            });
            this.logger.info('空室検索完了', {
                data: {
                    found_rooms: rooms.length
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rooms;
        }
        catch (error) {
            this.logger.error('空室検索エラー', error);
            throw error;
        }
    }
    /**
     * 部屋統計取得
     */
    static async getRoomStats(tenantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try {
            const [total, available, occupied, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cleaning, maintenance, outOfOrder, roomsByType, roomsByFloor] = await Promise.all([
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenantId: tenantId } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'available' } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'occupied' } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'cleaning' } }),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'maintenance' } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'out_of_order' } }),
                prisma_1.hotelDb.getAdapter().room.groupBy({
                    by: ['roomType'],
                    where: { tenantId: tenantId },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _count: true
                }),
                prisma_1.hotelDb.getAdapter().room.groupBy({
                    by: ['floor'],
                    where: { tenantId: tenantId },
                    _count: true
                })
            ]);
            const byType = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roomsByType.forEach((item) => {
                byType[item.roomType] = item._count;
            });
            const byFloor = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roomsByFloor.forEach((item) => {
                byFloor[item.floor_number] = item._count;
            });
            return {
                total,
                available,
                occupied,
                cleaning,
                maintenance,
                out_of_order: outOfOrder,
                by_type: byType,
                by_floor: byFloor
            };
        }
        catch (error) {
            this.logger.error('部屋統計取得エラー', error);
            throw error;
        }
    }
}
exports.RoomService = RoomService;
